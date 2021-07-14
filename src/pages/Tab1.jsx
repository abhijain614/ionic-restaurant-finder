import { IonContent, IonFab, IonFabButton, IonIcon, IonPage, IonSearchbar } from '@ionic/react';
import { useEffect, useState } from 'react';
import { getRecords } from '../main/yelp';
import styles from "../styles/Map.module.scss";

import { Map, Marker, Overlay } from "pigeon-maps";
import { maptiler } from 'pigeon-maps/providers';

import { MapOverlay } from "../components/MapOverlay";
import { CurrentPointOverlay } from "../components/CurrentPointOverlay";
import { flashOffOutline, flashOutline } from 'ionicons/icons';

const maptilerProvider = maptiler('d5JQJPLLuap8TkJJlTdJ', 'streets');

const Tab1 = () => {

	const [ currentPoint, setCurrentPoint ] = useState({ latitude: 54.509720, longitude: -6.037400 });
	const [ showCurrentPointInfo, setShowCurrentPointInfo ] = useState(false);

	const [ records, setRecords ] = useState(false);
	const [ results, setResults ] = useState(false);
	const [ center, setCenter ] = useState(false);
	const [ zoom, setZoom ] = useState(14);

	const [ searchTerm, setSearchTerm ] = useState("");
	const [ moveMode, setMoveMode ] = useState(false);

	useEffect(() => {

		const getData = async () => {

			const response = await getRecords(currentPoint);
			setRecords(response.allRecords);
			setResults(response.allRecords);
			setCenter(response.center);
		}

		getData();
	}, [ currentPoint ]);

	useEffect(() => {

		console.log(records);
	}, [ records ]);

	useEffect(() => {

		const search = searchTerm.toLowerCase();
		var searchResults = [];

		if (searchTerm !== "") {
			
			records.forEach(record => {

				if (record.name.toLowerCase().includes(search)) {

					searchResults.push(record);
				}
			});

			setResults(searchResults);
		} else {

			setResults(records);
		}

	}, [ searchTerm ]);

	const showMarkerInfo = (e, index) => {

		const clickedPoint = e.anchor;
		setCenter({ latitude: clickedPoint[0], longitude: clickedPoint[1] });

		const tempRecords = [ ...results ];

		//	Hide all current marker infos
		setShowCurrentPointInfo(false);
		
		if (!tempRecords[index].showInfo) {
			
			tempRecords.forEach(tempRecord => tempRecord.showInfo = false);
		}

		tempRecords[index].showInfo = !tempRecords[index].showInfo;

		setResults(tempRecords);
	}

	const hideMarkers = () => {

		const tempRecords = [ ...results ];
		tempRecords.forEach(tempRecord => tempRecord.showInfo = false);
		setResults(tempRecords);
		setShowCurrentPointInfo(false);
	}

	const handleMapClick = e => {

		const clickedPoint = e.latLng;
		setCurrentPoint({ latitude: clickedPoint[0], longitude: clickedPoint[1] });
		setMoveMode(false);
	}

	const handleShowCurrentPointInfo = () => {

		hideMarkers();
		setShowCurrentPointInfo(!showCurrentPointInfo);
	}

	return (
		<IonPage>
			<IonContent fullscreen>
				{ center && records && 
					<>

						<div className={ styles.overlaySearch }>
							<IonSearchbar animated={ true } value={ searchTerm } onIonChange={ e => setSearchTerm(e.target.value) } />
						</div>

						<Map onClick={ e => moveMode ? handleMapClick(e) : hideMarkers(e) } defaultCenter={ [center.latitude, center.longitude] } defaultZoom={ zoom } provider={ maptilerProvider } touchEvents={ true }>

							<Marker onClick={ handleShowCurrentPointInfo } color="red" width={ 50 } anchor={ currentPoint ? [ currentPoint.latitude, currentPoint.longitude] : [ center.latitude, center.longitude] } />

							{ results.map((record, index) => {

								return <Marker onClick={ e => showMarkerInfo(e, index) } key={ index } color="#3578e5" width={ 50 } anchor={ [ record.latitude, record.longitude ] } />
							})}

							{ results.map((record, index) => {

								if (record.showInfo) {
									
									return (
										<Overlay key={ index } anchor={ [ record.latitude, record.longitude ] } offset={[95, 304]}>
											<MapOverlay record={ record } />
										</Overlay>
									);
								}
							})}

							{ showCurrentPointInfo && 
								
								<Overlay anchor={ [ currentPoint.latitude, currentPoint.longitude ] } offset={[95, 153]}>
									<CurrentPointOverlay /> 
								</Overlay>
							}
						</Map>
					</>
				}

				<IonFab vertical="bottom" horizontal="end" slot="fixed" onClick={ () => setMoveMode(!moveMode) }>
          			<IonFabButton>
            			<IonIcon icon={ moveMode ? flashOffOutline : flashOutline } />
					</IonFabButton>
        		</IonFab>
			</IonContent>
		</IonPage>
	);
};

export default Tab1;