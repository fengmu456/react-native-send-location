import React from "react";
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {MapView, Marker} from "react-native-amap3d";

export default class SendLocationView extends React.Component {

    static defaultProps = {
        apiKey: "2bf69c9b4980f0fc915e9b03deed9bb6"
    };

    constructor(props) {
        super(props);
        this.state = {
            title: "",
            address: "",
            zoomLevel: 16,
            selectPosition: {latitude: 0, longitude: 0},
            currentPosition: {latitude: 0, longitude: 0},
            pois: []
        };
    }

    onSelect() {
        this.props.onClose && this.props.onClose();
        this.props.onSelect && this.props.onSelect({
            latitude: this.state.selectPosition.latitude,
            longitude: this.state.selectPosition.longitude,
            title: this.state.title,
            address: this.state.address
        });
    }

    renderHeader() {
        return <View style={styles.header}>
            <Text style={styles.headerText} onPress={this.props.onClose}>返回</Text>
            <Text style={styles.headerText}>选择位置</Text>
            <Text style={styles.headerText} onPress={this.onSelect.bind(this)}>发送</Text>
        </View>
    }

    renderItem({item}) {
        return <TouchableOpacity onPress={() => {
            this.setState({
                selectPosition: item.location,
                currentPosition: item.location,
                title: item.name,
                address: item.address
            });
        }}>
            <View style={styles.item}>
                <View>
                    <Text style={{fontSize: 16, color: "#444", marginBottom: 4}}>{item.name}</Text>
                    <Text style={{fontSize: 13, color: "#afafaf"}}>{item.address}</Text>
                </View>
                {item.name === this.state.title && <View style={styles.itemSelector}/>}
            </View>
        </TouchableOpacity>
    }

    onLocation({nativeEvent}) {
        if (Math.floor(this.state.currentPosition.longitude) === 0 && Math.floor(this.state.currentPosition.latitude) === 0) {
            this.setState({
                currentPosition: {latitude: nativeEvent.latitude, longitude: nativeEvent.longitude},
            });
            this.onPress({nativeEvent});
        }
    }

    onPress({nativeEvent}) {
        const {longitude, latitude} = nativeEvent;
        this.setState({selectPosition: nativeEvent, pois: []});
        const url = `http://restapi.amap.com/v3/geocode/regeo?extensions=all&key=${this.props.apiKey}&location=${longitude},${latitude}`;
        fetch(url).then(res => res.json()).then(data => {
            let pois = [];
            const map = {};
            data.regeocode.pois.forEach(poi => {
                if (map[poi.name]) return;
                const location = poi.location.split(",");
                poi.location = {
                    latitude: parseFloat(location[1]),
                    longitude: parseFloat(location[0])
                };
                const a = {latitude, longitude};
                const b = poi.location;
                pois.push({
                    ...poi,
                    key: poi.name,
                    // 计算距离
                    dist: Math.sqrt(Math.pow(a.latitude - b.latitude, 2) + Math.pow(a.longitude - b.longitude, 2))
                });
                map[poi.name] = true;
            });
            pois.sort((a, b) => a.dist - b.dist);
            if (pois.length > 0) {
                this.setState({pois: pois, title: pois[0].name, address: pois[0].address});
            }
        })
    }

    render() {
        return <View style={styles.layout}>
            <View style={{flex: 1}}>
                {this.renderHeader()}
                <MapView style={{flex: 1}} locationEnabled={true} onLocation={this.onLocation.bind(this)}
                         coordinate={this.state.currentPosition} zoomLevel={18}
                         showsZoomControls={false} showsLocationButton={true}
                         locationStyle={{fillColor: "transparent", strockeWidth: 0}}
                         onPress={this.onPress.bind(this)}
                         rotateEnabled={false} tiltEnabled={false} showsCompass={false}>
                    <Marker coordinate={this.state.selectPosition} color="red"/>
                </MapView>
                <FlatList style={{flex: 1, backgroundColor: "#fff"}} data={this.state.pois}
                          renderItem={this.renderItem.bind(this)}/>
            </View>
        </View>;
    }
}

const styles = StyleSheet.create({
    layout: {
        flex: 1, position: "absolute", top: 0, right: 0, left: 0, bottom: 0, backgroundColor: "#fff"
    },
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
});