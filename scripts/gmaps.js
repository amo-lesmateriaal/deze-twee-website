var
	//  Copy the contents of Gmaps into the local map variable.
	map                 = gmaps,
	markers             = [],
	popups              = [];

//  Load a new Google maps map into the #map-canvas element.
//  Set the map to zoom level 8 and center on the Netherlands.
map.init( 'map-canvas', 49.950000, 5.408000, 8, false );

$.getJSON( 'storage/bevolkingskernen.json', function( data ) {

	//  Loop through the coordinates in the mentioned file.
	//  Use the X and Y value to create a new marker on the map.
	for ( var i in data )
	{
		var
			//  A brand-spanking new Google Maps marker object.
			marker      = map.getMarker(
				data[i].Y,
				data[i].X,
				data[i].kern_naam
			);

			//  Add searchable characteristics to the marker.
			//  A marker represents a town or city, the following data is used to inform about location.
			marker.filterData   = {

				"id" : i,
				"title" : data[i].kern_naam,
				"opp" : data[i].opp08tot,
				"bev" : data[i].bev08tot,
				"lft" : data[i].gemlft08,
				"won" : data[i].woning08
			};

		//  Store the marker to add it to the map later on.
		markers.push( marker );
	}

	//  Clear the data variable, since it will not be used anymore.
	delete data;

	//  Iterate all the markers we stored above.
	$.each( markers, function( i ) {

		var
			body            = '<h5>Van ' + markers[i].filterData.title + ' was in 2008 het volgende bekend:</h5>';
			body           += '<ul>';
			body           += map.getInfoBullet(
				'Lengtegraad',
				markers[i].position.lat()
			);

			body           += map.getInfoBullet(
				'Breedtegraad',
				markers[i].position.lng(),
				'<br><br>'
			);

			body           += map.getInfoBullet(
				'Totale oppervlakte',
				markers[i].filterData.opp,
				'ha. ( ' + ( markers[i].filterData.opp / 100 ).toPrecision( 2 ) + ' km2 )'
			);

			body           += map.getInfoBullet(
				'Aantal woningen',
				markers[i].filterData.won
			);

			body           += map.getInfoBullet(
				'Aantal inwoners',
				markers[i].filterData.bev,
				'personen<br><br>'
			);

			body           += map.getInfoBullet(
				'Gemiddelde leeftijd',
				markers[i].filterData.lft,
				'jaar'
			);

			body           += '</ul>';

			body           += '<a href="https://maps.google.com/maps?q=&layer=c&cbll=' + markers[i].position.lat() + ',' + markers[i].position.lng() + '" target="_blank">';
			body           += 'Bekijk deze locatie op Google Maps Street View';
			body           += '</a>';

		//  A brand spanking new Google Maps infoWindow object.
		var
			popup           = map.getInfoWindow(
				markers[i].filterData.title,
				body
			),
			marker          = markers[i];

		//  This script is run after clicking a marker on the map.
		google.maps.event.addListener( marker, 'click', function() {

			//  Iterate all the popups.
			for ( var i in popups )
			{
				//  Close all this popups ( whether opened or not ).
				popups[i].close();
			}

			//  Open the popup belonging to the clicked marker.
			popup.open( map.getMap(), marker );
		});

		//  Place the current marker ( now with infowindow ) on the map.
		map.setMarker( marker );
		popups[i]       = popup;
	});

	map.doClusterMarkers( markers );
});

var
	filter                  = $( '#map-filter'),
	isProcessing            = false,
	isReset                 = false,
	tmpMarkers              = [],
	value                   = null;

if ( filter.length > 0 )
{
	filter.stop( true, false ).keyup( function( event ) {

		isReset                 = isReset && this.value !== '' ? false : isReset;

		if ( !isProcessing )
		{
			if ( !isReset )
			{
				map.doCenterMap();

				//  Lock the command from executing multiple times.
				isProcessing    = true;

				map.doClearMarkers();
				tmpMarkers      = [];

				if ( this.value === '' )
				{
					isReset     = true;
				}

				//  Construct a search value.
				//  Do note, if the input is empty the greedy parameter ensures all markers are shown.
				value           = new RegExp( this.value, "gi" );

				//  Iterate through the markers.
				for ( var i in markers )
				{
					//  Determine if the search term matches the current markers title.
					if ( markers[i].filterData.title.match( value ) )
					{
						//  Place matched markers on the map.
						map.setMarker( markers[i] );

						//  Add matched markers to the collection.
						tmpMarkers.push( markers[i] );
					}
				}

				//  Cluster the matched markers.
				map.doClusterMarkers( tmpMarkers );

				//  Unlock the command.
				isProcessing    = false;
			}
			return;
		}

		alert( "I might be sexy... But I can't do two things at once. Be patient!" );
	});
}