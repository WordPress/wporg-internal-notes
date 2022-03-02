<?php

add_filter( 'wp_is_application_passwords_available', '__return_true' );

add_post_type_support( 'post', 'wporg-internal-notes' );
add_post_type_support( 'post', 'wporg-log-notes' );
