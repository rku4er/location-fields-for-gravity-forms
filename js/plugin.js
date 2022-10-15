jQuery( document ).ready( function( $ ) {

	if ( $('.lffgf-map-container').length > 0 ) {

		/**
		 * Setup the map lookup
		 */
		var map    = null;
		var marker = null;

		initialize_map( $('.lffgf-map-container') );

		function initialize_map( map_instance ) {
			var search_input = map_instance.find( '.lffgf-search' );
			var map_canvas   = map_instance.find( '.lffgf-map' );
			var latitude     = map_instance.find( '.lffgf-latitude' );
			var longitude    = map_instance.find( '.lffgf-longitude' );
			var latLng       = new google.maps.LatLng( 2, 20 );
			var zoom         = 3;

			// If we have saved values, let's set the position and zoom level
			if ( latitude.val().length > 0 && longitude.val().length > 0 ) {
				latLng = new google.maps.LatLng( latitude.val(), longitude.val() );
				zoom = 17;
			}

			// Map
			var map_options = {
				center: latLng,
				zoom: zoom
			};
			map = new google.maps.Map( map_canvas[0], map_options );

			// Marker
			var marker_options = {
				map: map,
				draggable: true,
				title: 'Drag pin to set the exact location'
			};
			marker = new google.maps.Marker( marker_options );

			if ( latitude.val().length > 0 && longitude.val().length > 0 ) {
				marker.setPosition( latLng );
			}

			// Info Window
			var infowindow = new google.maps.InfoWindow();
			var infowindowContent = document.querySelector('.infowindow-content');
			infowindow.setContent( infowindowContent );

			// Search
			var autocompleteOptions = {
				componentRestrictions: { country: ['DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG', 'ML', 'MW', 'MR', 'MU', 'YT', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RE', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'EH', 'ZM', 'ZW'] },
				types: ['restaurant', 'cafe', 'bar', 'bakery']
			};

			var autocomplete = new google.maps.places.Autocomplete( search_input[0], autocompleteOptions );
			autocomplete.bindTo( 'bounds', map );

			google.maps.event.addListener( autocomplete, 'place_changed', function() {
				infowindow.close();
				marker.setVisible(false);

				var place = autocomplete.getPlace();
				if (!place.geometry || !place.geometry.location) {
					// User entered the name of a Place that was not suggested and
					// pressed the Enter key, or the Place Details request failed.
					window.alert("No details available for input: '" + place.name + "'");
					return;
				}

				// If the place has a geometry, then present it on a map.
				if (place.geometry.viewport) {
					map.fitBounds(place.geometry.viewport);
				} else {
					map.setCenter(place.geometry.location);
					map.setZoom(17); // Why 17? Because it looks good.
				}

				marker.setPosition(place.geometry.location);
				marker.setVisible(true);
				var address = "";
				if (place.address_components) {
					address = [place.address_components[0] && place.address_components[0].short_name || "", place.address_components[1] && place.address_components[1].short_name || "", place.address_components[2] && place.address_components[2].short_name || ""].join(" ");
				}

				infowindowContent.querySelector(".place-icon").src = place.icon;
				infowindowContent.querySelector(".place-name").innerText = place.name;
				infowindowContent.querySelector(".place-address").textContent = address;
				infowindow.open(map, marker);

				latitude.val( place.geometry.location.lat() );
				longitude.val( place.geometry.location.lng() );
			});

			$( search_input ).keypress( function( event ) {
				if ( 13 === event.keyCode ) {
					event.preventDefault();
				}
			});

			// Allow marker to be repositioned
			google.maps.event.addListener( marker, 'drag', function() {
				latitude.val( marker.getPosition().lat() );
				longitude.val( marker.getPosition().lng() );
			});
		}

		/**
		 * Populate map with Postcode search
		 */

		if ( $('.lffgf-alternate-input').length > 0 ) {
			var alternate_input_selector = $('.lffgf-alternate-input').val();

			if ( '' != alternate_input_selector ) {
				$( alternate_input_selector ).blur( function() {
					var address_lookup = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
					var key            = jshelper.google_api_key;
					var url            = address_lookup + $( alternate_input_selector ).val() + '&key=' + key;

					$.getJSON( url, function( data ) {
						if ( 'OK' === data.status ) {
							var latitude  = data.results[0].geometry.location.lat;
							var longitude = data.results[0].geometry.location.lng;
							var latitude_input  = $( '.lffgf-latitude' );
							var longitude_input = $( '.lffgf-longitude' );
							latitude_input.val( latitude );
							longitude_input.val( longitude );
							var latLng = new google.maps.LatLng( latitude, longitude );
							marker.setPosition( latLng );
							map.setCenter( marker.getPosition() );
							map.setZoom( 17 );
						}
					});
				});
			}
		}

		/**
		 * Check for postcode update if it is populated dynamically
		 * This is handy if the postcode field is hidden
		 */
		// if ( $('.lffgf-alternate-input').length > 0 ) {
		// 	var alternate_input_selector = $('.lffgf-alternate-input').val();
		// 	var alternate_input_value    = $( alternate_input_selector ).val();
		//
		// 	function alternate_input_watch(){
		//         if ( $( alternate_input_selector ).val() !== alternate_input_value ) {
		// 			alternate_input_value = $( alternate_input_selector ).val();
		// 			$( alternate_input_selector ).trigger('blur');
		// 		}
		//         setTimeout( alternate_input_watch, 1000 );
		//     };
		//     alternate_input_watch();
		// }
	}

});
