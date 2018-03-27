import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import SendLocation from "../src/SendLocation";

export default class Example extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			address: "请选择位置",
			showSendLocation: false,
		};
	}

	onSelect( info ) {
		this.setState( { address: JSON.stringify( info ) } )
	}

	render() {
		return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>{this.state.address}</Text>
			<TouchableOpacity onPress={() => this.setState( { showSendLocation: true } )}>
				<Text style={styles.btn}>选择位置</Text>
			</TouchableOpacity>
			{this.state.showSendLocation &&
			<SendLocation onSelect={this.onSelect.bind( this )}
						  onClose={() => this.setState( { showSendLocation: false } )}/>}
		</View>
	}

}

const styles = StyleSheet.create( {
	btn: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: "#24b2ff",
		borderRadius: 10,
		marginTop: 20
	}
} );