import React from "react";
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MapView } from "react-native-amap3d";

export default class SendLocation extends React.Component {

	static defaultProps = {
		key: "2bf69c9b4980f0fc915e9b03deed9bb6"
	};

	constructor( props ) {
		super( props );
		this.state = {
			title: "",
			address: "",
			zoomLevel: 16,
			selectPosition: { latitude: 0, longitude: 0 },
			currentPosition: { latitude: 0, longitude: 0 },
			pois: []
		};
	}

	onSelect() {
		this.props.onClose && this.props.onClose();
		this.props.onSelect && this.props.onSelect( {
			latitude: this.state.selectPosition.latitude,
			longitude: this.state.selectPosition.longitude,
			title: this.state.title,
			address: this.state.address
		} );
	}

	renderHeader() {
		return <View style={styles.header}>
			<Text style={styles.headerText} onPress={this.props.onClose}>返回</Text>
			<Text style={styles.headerText}>选择位置</Text>
			<Text style={styles.headerText} onPress={this.onSelect.bind( this )}>发送</Text>
		</View>
	}

	renderItem( { item } ) {
		return <TouchableOpacity onPress={() => {
			const location = item.location.split( "," );
			this.setState( {
				selectPosition: {
					latitude: parseFloat( location[ 1 ] ),
					longitude: parseFloat( location[ 0 ] )
				},
				currentPosition: {
					latitude: parseFloat( location[ 1 ] ),
					longitude: parseFloat( location[ 0 ] )
				},
				title: item.name,
				address: item.address
			} );
		}}>
			<View style={styles.item}>
				<View>
					<Text style={{ fontSize: 16, color: "#444", marginBottom: 4 }}>{item.name}</Text>
					<Text style={{ fontSize: 13, color: "#afafaf" }}>{item.address}</Text>
				</View>
				{item.name === this.state.title && <View style={styles.itemSelector}/>}
			</View>
		</TouchableOpacity>
	}

	onLocation( { nativeEvent } ) {
		if ( Math.floor( this.state.currentPosition.longitude ) === 0 && Math.floor( this.state.currentPosition.latitude ) === 0 ) {
			this.setState( {
				currentPosition: { latitude: nativeEvent.latitude, longitude: nativeEvent.longitude },
			} );
		}
	}

	onStatusChange( { nativeEvent } ) {
		const { longitude, latitude, rotation, zoomLevel, tilt } = nativeEvent;
		this.setState( { currentPosition: { latitude, longitude }, zoomLevel } );
		const url = `http://restapi.amap.com/v3/geocode/regeo?extensions=all&key=${this.props.key}&location=${longitude},${latitude}`;
		fetch( url ).then( res => res.json() ).then( data => {
			const pois = [];
			const map = {};
			data.regeocode.pois.forEach( poi => {
				if ( map[ poi.name ] ) return;
				pois.push( {
					...poi,
					key: poi.name
				} );
				map[ poi.name ] = true;
			} );
			this.setState( { pois: pois } );
		} )
	}

	render() {
		return <Modal visible={true} onRequestClose={this.props.onClose}>
			<View style={{ flex: 1 }}>
				{this.renderHeader()}
				<View style={{ flex: 1 }}>
					<MapView style={{ flex: 1 }} locationEnabled={true} onLocation={this.onLocation.bind( this )}
							 coordinate={this.state.currentPosition} zoomLevel={18}
							 showsZoomControls={false} showsLocationButton={true}
							 locationStyle={{ fillColor: "transparent", strockeWidth: 0 }}
							 onStatusChangeComplete={this.onStatusChange.bind( this )}
							 rotateEnabled={false} tiltEnabled={false} showsCompass={false}>
					</MapView>
					<View style={styles.centerMarker}>
						<Image source={require( "./red.png" )} style={{ width: 27, height: 37 }}/>
					</View>
				</View>
				<FlatList style={{ flex: 1 }} data={this.state.pois} renderItem={this.renderItem.bind( this )}/>
			</View>
		</Modal>;
	}
}

const styles = StyleSheet.create( {
	header: {
		flexDirection: "row",
		height: 45,
		backgroundColor: "#fff",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 10
	},
	headerText: {
		fontSize: 16,
		color: "#424242"
	},
	centerMarker: {
		position: "absolute",
		top: 0,
		bottom: 35,
		left: 0,
		right: 0,
		justifyContent: "center",
		alignItems: "center"
	},
	item: {
		borderTopWidth: 0.5,
		borderColor: "#dddddd",
		paddingHorizontal: 10,
		paddingVertical: 5,
		alignItems: "center",
		justifyContent: "space-between",
		flexDirection: "row"
	},
	itemSelector: {
		width: 10, height: 10, backgroundColor: "#a3e9a4", borderRadius: 5
	}
} );