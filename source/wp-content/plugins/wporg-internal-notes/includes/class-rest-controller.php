<?php

namespace WordPressdotorg\InternalNotes;

defined( 'WPINC' ) || die();

/**
 * Class REST_Controller
 *
 * @package WordPressdotorg\InternalNotes
 */
class REST_Controller extends \WP_REST_Controller {
	/**
	 * Parent post type.
	 *
	 * @var string
	 */
	protected $parent_post_type;

	/**
	 * The base of the parent controller's route.
	 *
	 * @var string
	 */
	protected $parent_base;

	/**
	 * Parent controller.
	 *
	 * @var \WP_REST_Controller
	 */
	protected $parent_controller;

	/**
	 * Constructor.
	 *
	 * @param string $parent_post_type Post type of the parent.
	 */
	public function __construct( $parent_post_type ) {
		$this->namespace = 'wp/v2';
		$this->rest_base = 'internal-notes';

		$post_type_object = get_post_type_object( $parent_post_type );
		if ( $post_type_object instanceof \WP_Post_Type ) {
			$this->parent_post_type  = $parent_post_type;
			$this->parent_base       = ! empty( $post_type_object->rest_base ) ? $post_type_object->rest_base : $post_type_object->name;
			$this->parent_controller = $post_type_object->get_rest_controller();
		}
	}

	/**
	 * Registers the routes for the objects of the controller.
	 *
	 * @see register_rest_route()
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->parent_base . '/(?P<parent>[\d]+)/' . $this->rest_base,
			array(
				'args'   => array(
					'parent' => array(
						'description' => __( 'The ID for the parent of the object.', 'wporg' ),
						'type'        => 'integer',
					),
				),
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->parent_base . '/(?P<parent>[\d]+)/' . $this->rest_base . '/(?P<id>[\d]+)',
			array(
				'args'   => array(
					'parent' => array(
						'description' => __( 'The ID for the parent of the object.', 'wporg' ),
						'type'        => 'integer',
					),
					'id'     => array(
						'description' => __( 'The ID for the note object.', 'wporg' ),
						'type'        => 'integer',
					),
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Checks if a given request has access.
	 *
	 * Only users who can edit all posts of the given post type can view and create internal notes.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 *
	 * @return true|\WP_Error True if the request has access, WP_Error object otherwise.
	 */
	public function permissions_check( $request ) {
		$parent = $this->get_parent( $request['parent'] );
		if ( is_wp_error( $parent ) ) {
			return $parent;
		}

		switch ( $request->get_method() ) {
			case \WP_REST_Server::READABLE:
				$cap = 'read-notes';
				$arg = $parent->ID;
				$msg = __( 'Sorry, you are not allowed to access internal notes on this post.', 'wporg' );
				break;
			case \WP_REST_Server::CREATABLE:
				$cap = 'create-note';
				$arg = $parent->ID;
				$msg = __( 'Sorry, you are not allowed to create internal notes on this post.', 'wporg' );
				break;
			case \WP_REST_Server::DELETABLE:
				$cap = 'delete-note';
				$arg = $request['id'];
				$msg = __( 'Sorry, you are not allowed to delete this note.', 'wporg' );
				break;
			default:
				$cap = 'do_not_allow';
				$arg = null;
				break;
		}

		if ( ! current_user_can( $cap, $arg ) ) {
			return new \WP_Error(
				'rest_cannot_access',
				$msg,
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}

	/**
	 * Retrieves a collection of items.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 *
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_items( $request ) {
		$parent = $this->get_parent( $request['parent'] );
		if ( is_wp_error( $parent ) ) {
			return $parent;
		}

		$args = array();

		$collection_params = array(
			'offset'   => 'offset',
			'order'    => 'order',
			'page'     => 'paged',
			'per_page' => 'posts_per_page',
		);
		foreach ( $collection_params as $request_param => $query_param ) {
			if ( isset( $request[ $request_param ] ) ) {
				$args[ $query_param ] = $request[ $request_param ];
			}
		}

		if ( isset( $request['after'] ) ) {
			$args['date_query'] = array(
				array(
					'after'  => $request['after'],
					'column' => 'post_date',
				),
			);
		}

		$notes_query = get_notes( $parent->ID, $args, true );
		$notes       = $notes_query->get_posts();

		$response = array();
		foreach ( $notes as $note ) {
			$data       = $this->prepare_item_for_response( $note, $request );
			$response[] = $this->prepare_response_for_collection( $data );
		}

		$response = rest_ensure_response( $response );

		$response->header( 'X-WP-Total', $notes_query->found_posts );
		$response->header( 'X-WP-TotalPages', $notes_query->max_num_pages );

		return $response;
	}

	/**
	 * Creates one item from the collection.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 *
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function create_item( $request ) {
		$parent = $this->get_parent( $request['parent'] );
		if ( is_wp_error( $parent ) ) {
			return $parent;
		}

		$prepared_note = $this->prepare_item_for_database( $request );

		if ( is_wp_error( $prepared_note ) ) {
			return $prepared_note;
		}

		$note_id = create_note( $parent->ID, (array) $prepared_note );
		if ( is_wp_error( $note_id ) ) {
			return $note_id;
		}

		$note = $this->get_note( $note_id );
		if ( is_wp_error( $note ) ) {
			return $note;
		}

		$note     = $this->prepare_item_for_response( $note, $request );
		$response = rest_ensure_response( $note );

		$response->set_status( 201 );

		return $response;
	}

	/**
	 * Deletes one item from the collection.
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_item( $request ) {
		$note = $this->get_note( $request['id'] );
		if ( is_wp_error( $note ) ) {
			return $note;
		}

		$previous = $this->prepare_item_for_response( $note, $request );

		$result = delete_note( $note->ID );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$response = new \WP_REST_Response();
		$response->set_data(
			array(
				'deleted'  => true,
				'previous' => $previous->get_data(),
			)
		);

		return $response;
	}

	/**
	 * Prepares one item for create or update operation.
	 *
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return \stdClass|\WP_Error Post object or WP_Error.
	 */
	protected function prepare_item_for_database( $request ) {
		$prepared_note = new \stdClass();

		$excerpt = false;
		if ( isset( $request['excerpt'] ) && is_string( $request['excerpt'] ) ) {
			$excerpt = sanitize_textarea_field( $request['excerpt'] );
		} elseif ( isset( $request['excerpt']['raw'] ) && is_string( $request['excerpt']['raw'] ) ) {
			$excerpt = sanitize_textarea_field( $request['excerpt']['raw'] );
		}

		if ( ! $excerpt ) {
			return new \WP_Error(
				'rest_missing_param',
				__( 'The post_excerpt parameter must contain a valid string.', 'wporg' ),
				array( 'status' => 400 )
			);
		}

		$schema = $this->get_item_schema();
		$valid  = rest_validate_string_value_from_schema(
			$excerpt,
			$schema['properties']['excerpt']['properties']['raw'],
			'message'
		);

		if ( is_wp_error( $valid ) ) {
			return $valid;
		}

		$prepared_note->post_author  = get_current_user_id();
		$prepared_note->post_excerpt = $excerpt;

		return $prepared_note;
	}

	/**
	 * Prepares the item for the REST response.
	 *
	 * @param \WP_Post         $note    WordPress representation of the item.
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function prepare_item_for_response( $note, $request ) {
		setup_postdata( $note );

		// Base fields for every post.
		$data = array();

		$data['date']     = $this->prepare_date_response( $note->post_date_gmt, $note->post_date );
		$data['date_gmt'] = $this->prepare_date_response( $note->post_date_gmt );

		$data['date_relative'] = sprintf(
			'%s ago',
			human_time_diff( strtotime( $note->post_date_gmt ), time() )
		);

		$data['id']     = (int) $note->ID;
		$data['parent'] = (int) $note->post_parent;
		$data['author'] = (int) $note->post_author;
		$data['type']   = $note->post_type;

		$data['excerpt'] = array(
			'raw'       => $note->post_excerpt,
			'rendered'  => wpautop( $note->post_excerpt ),
		);

		$context  = ! empty( $request['context'] ) ? $request['context'] : 'view';
		$data     = $this->filter_response_by_context( $data, $context );
		$response = rest_ensure_response( $data );

		$response->add_link(
			'author',
			rest_url( sprintf( '%s/%s/%d', $this->namespace, 'users', $data['author'] ) ),
			array(
				'embeddable' => true,
			)
		);

		return $response;
	}

	/**
	 * Checks the post_date_gmt or modified_gmt and prepare any post or
	 * modified date for single post output.
	 *
	 * @param string      $date_gmt GMT publication time.
	 * @param string|null $date     Optional. Local publication time. Default null.
	 *
	 * @return string|null ISO8601/RFC3339 formatted datetime.
	 */
	protected function prepare_date_response( $date_gmt, $date = null ) {
		// Use the date if passed.
		if ( isset( $date ) ) {
			return mysql_to_rfc3339( $date );
		}

		// Return null if $date_gmt is empty/zeros.
		if ( '0000-00-00 00:00:00' === $date_gmt ) {
			return null;
		}

		// Return the formatted datetime.
		return mysql_to_rfc3339( $date_gmt );
	}

	/**
	 * Retrieves the item's schema, conforming to JSON Schema.
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema() {
		if ( $this->schema ) {
			return $this->schema;
		}

		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => "{$this->parent_post_type}-{$this->rest_base}",
			'type'       => 'object',
			'properties' => array(
				'date'          => array(
					'description' => __( "The date the note was added, in the site's timezone.", 'wporg' ),
					'type'        => array( 'string', 'null' ),
					'format'      => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'date_gmt'      => array(
					'description' => __( 'The date the note was added, as GMT.', 'wporg' ),
					'type'        => array( 'string', 'null' ),
					'format'      => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'date_relative' => array(
					'description' => __( 'The date the note was added, as a human-readable relative string.', 'wporg' ),
					'type'        => array( 'string' ),
					'format'      => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'id'            => array(
					'description' => __( 'Unique identifier for the post.', 'wporg' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'parent'        => array(
					'description' => __( 'The ID for the parent of the post.', 'wporg' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'author'        => array(
					'description' => __( 'The ID for the author of the post.', 'wporg' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'type'         => array(
					'description' => __( 'Type of note.', 'wporg' ),
					'type'        => 'string',
					'enum'        => get_note_post_types(),
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'excerpt'       => array(
					'description' => __( 'The excerpt for the post.', 'wporg' ),
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'arg_options' => array(
						'sanitize_callback' => null, // Note: sanitization implemented in self::prepare_item_for_database().
						'validate_callback' => null, // Note: validation implemented in self::prepare_item_for_database().
					),
					'properties'  => array(
						'raw'      => array(
							'description' => __( 'Excerpt for the post, as it exists in the database.', 'wporg' ),
							'type'        => 'string',
							'context'     => array( 'edit' ),
							'maxLength'   => 1000,
						),
						'rendered' => array(
							'description' => __( 'HTML excerpt for the post, transformed for display.', 'wporg' ),
							'type'        => 'string',
							'context'     => array( 'view', 'edit' ),
							'readonly'    => true,
						),
					),
				),
			),
		);

		$this->schema = $schema;

		return $this->schema;
	}

	/**
	 * Retrieves the query params for the collections.
	 *
	 * @return array Query parameters for the collection.
	 */
	public function get_collection_params() {
		$params = parent::get_collection_params();

		$params['offset'] = array(
			'description' => __( 'Offset the result set by a specific number of items.', 'wporg' ),
			'type'        => 'integer',
		);

		$params['after'] = array(
			'description' => __( 'Limit response to posts published after a given ISO8601 compliant date.', 'wporg' ),
			'type'        => 'string',
			'format'      => 'date-time',
		);

		$params['order'] = array(
			'description' => __( 'Order sort attribute ascending or descending.', 'wporg' ),
			'type'        => 'string',
			'default'     => 'desc',
			'enum'        => array( 'asc', 'desc' ),
		);

		unset( $params['search'] );

		return $params;
	}

	/**
	 * Get the parent post, if the ID is valid.
	 *
	 * @param int $parent Supplied ID.
	 *
	 * @return \WP_Post|\WP_Error Post object if ID is valid, WP_Error otherwise.
	 */
	protected function get_parent( $parent ) {
		$error = new \WP_Error(
			'rest_post_invalid_parent',
			__( 'Invalid post parent ID.', 'wporg' ),
			array( 'status' => 404 )
		);
		if ( (int) $parent <= 0 ) {
			return $error;
		}

		$parent = get_post( (int) $parent );
		if ( empty( $parent ) || empty( $parent->ID ) || $this->parent_post_type !== $parent->post_type ) {
			return $error;
		}

		return $parent;
	}

	/**
	 * Get the note post, if the ID is valid.
	 *
	 * @param int $note_id Supplied ID.
	 *
	 * @return \WP_Post|\WP_Error Post object if ID is valid, WP_Error otherwise.
	 */
	protected function get_note( $note_id ) {
		$error = new \WP_Error(
			'rest_post_invalid_id',
			__( 'Invalid post ID.', 'wporg' ),
			array( 'status' => 404 )
		);

		if ( (int) $note_id <= 0 ) {
			return $error;
		}

		$post = get_post( (int) $note_id );
		if ( empty( $post ) || empty( $post->ID ) || ! in_array( $post->post_type, get_note_post_types(), true ) ) {
			return $error;
		}

		return $post;
	}
}
