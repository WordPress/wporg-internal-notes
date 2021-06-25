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
						'description' => __( 'The ID for the parent of the object.', 'wporg-internal-notes' ),
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

		$parent_post_type_object = get_post_type_object( $this->parent_post_type );

		if ( ! current_user_can( $parent_post_type_object->cap->edit_others_posts ) ) {
			return new \WP_Error(
				'rest_cannot_read',
				__( 'Sorry, you are not allowed to view or create internal notes on this post.', 'wporg-internal-notes' ),
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

		$collection_params = array_keys( $this->get_collection_params() );
		foreach ( $collection_params as $param ) {
			if ( isset( $request[ $param ] ) ) {
				$args[ $param ] = $request[ $param ];
			}
		}

		$total_notes = get_notes( $parent->ID, array( 'count_only' => true ) );
		$max_pages   = ceil( $total_notes / $args['per_page'] );

		$notes = get_notes( $parent->ID, $args );

		$response = array();
		foreach ( $notes as $note ) {
			$data       = $this->prepare_item_for_response( $note, $request );
			$response[] = $this->prepare_response_for_collection( $data );
		}

		$response = rest_ensure_response( $response );

		$response->header( 'X-WP-Total', (int) $total_notes );
		$response->header( 'X-WP-TotalPages', (int) $max_pages );

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

		$meta_id = add_note( $parent->ID, $prepared_note );
		if ( false === $meta_id ) {
			return new \WP_Error(
				'rest_create_item_failed',
				__( 'Could not create note.', 'wporg-internal-notes' ),
				array( 'status' => 500 )
			);
		}

		$meta     = get_metadata_by_mid( 'post', $meta_id );
		$note     = maybe_unserialize( $meta->meta_value );
		$note     = $this->prepare_item_for_response( $note, $request );
		$response = rest_ensure_response( $note );

		$response->set_status( 201 );

		return $response;
	}

	/**
	 * Prepares one item for create or update operation.
	 *
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return array|\WP_Error The prepared item, or WP_Error object on failure.
	 */
	protected function prepare_item_for_database( $request ) {
		$message = false;
		if ( isset( $request['message'] ) && is_string( $request['message'] ) ) {
			$message = sanitize_textarea_field( $request['message'] );
		} elseif ( isset( $request['message']['raw'] ) && is_string( $request['message']['raw'] ) ) {
			$message = sanitize_textarea_field( $request['message']['raw'] );
		}

		if ( ! $message ) {
			return new \WP_Error(
				'rest_missing_param',
				__( 'The message parameter must contain a valid string.', 'wporg-internal-notes' ),
				array( 'status' => 400 )
			);
		}

		$schema   = $this->get_item_schema();
		$valid = rest_validate_string_value_from_schema(
			$message,
			$schema['properties']['message']['properties']['raw'],
			'message'
		);

		if ( is_wp_error( $valid ) ) {
			return $valid;
		}

		$prepared_note = array(
			'author'    => get_current_user_id(),
			'timestamp' => time(),
			'message'   => $message,
		);

		return $prepared_note;
	}

	/**
	 * Prepares the item for the REST response.
	 *
	 * @param mixed           $item    WordPress representation of the item.
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function prepare_item_for_response( $item, $request ) {
		$date_format = get_option( 'date_format' );
		$time_format = get_option( 'time_format' );

		$timestamp         = array(
			'raw'      => absint( $item['timestamp'] ),
			'rendered' => wp_date( "$date_format $time_format", $item['timestamp'] ),
		);
		$item['timestamp'] = $timestamp;

		$message         = array(
			'raw'      => $item['message'],
			'rendered' => wpautop( $item['message'] ),
		);
		$item['message'] = $message;

		$context  = ! empty( $request['context'] ) ? $request['context'] : 'view';
		$item     = $this->filter_response_by_context( $item, $context );
		$response = rest_ensure_response( $item );

		$response->add_link(
			'author',
			rest_url( sprintf( '%s/%s/%d', $this->namespace, 'users', $item['author'] ) ),
			array(
				'embeddable' => true,
			)
		);

		return $response;
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
				'author'       => array(
					'description' => __( 'The ID for the author of the note.', 'wporg-internal-notes' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'timestamp' => array(
					'description' => __( 'The creation date of the note.', 'wporg-internal-notes' ),
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
					'properties'  => array(
						'raw' => array(
							'description' => __( 'The creation date of the note, stored as a Unix timestamp.', 'wporg-internal-notes' ),
							'type'        => 'integer',
							'context'     => array( 'edit' ),
						),
						'rendered' => array(
							'description' => __( 'The creation date of the note, formatted as a date string.', 'wporg-internal-notes' ),
							'type'        => 'string',
							'format'      => 'date-time',
							'context'     => array( 'view', 'edit' ),
						),
					),
				),
				'message'   => array(
					'description' => __( 'The content of the note.', 'wporg-internal-notes' ),
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'required'    => true,
					'arg_options' => array(
						// This allows for submitting the message param as a string when creating a new note.
						'sanitize_callback' => null, // Note: sanitization implemented in self::prepare_item_for_database().
						'validate_callback' => null, // Note: validation implemented in self::prepare_item_for_database().
					),
					'properties'  => array(
						'raw' => array(
							'description' => __( 'The content of the note, as stored in the database.', 'wporg-internal-notes' ),
							'type'        => 'string',
							'context'     => array( 'edit' ),
							'maxLength'   => 2000,
						),
						'rendered' => array(
							'description' => __( 'The content of the note, as rendered for display.', 'wporg-internal-notes' ),
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

		$params['order'] = array(
			'description' => __( 'Order sort attribute ascending or descending.', 'wporg-internal-notes' ),
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
			__( 'Invalid post parent ID.', 'wporg-internal-notes' ),
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
}
