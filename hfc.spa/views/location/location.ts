﻿/// <reference path="../../scripts/typings/require.d.ts" />
/// <reference path="../../scripts/typings/jquery.d.ts" />
/// <reference path="../../scripts/typings/kendo.all.d.ts" />
/// <reference path="../../scripts/common.ts" />
module hfc {
    export class locationvm extends kendo.data.ObservableObject {
        public item: any;
        public refpath: string;

        public setup(item, refpath): void {
            this.set("item", item);
			this.set("refpath", refpath);
       }

        public init(): void {
            this.bind("change", e => {
                var data = this.get('item');
                var lat = data.geometry.coordinates[0];
                var lng = data.geometry.coordinates[1];
                $("#map").kendoMap({
                    center: [lat, lng],
                    zoom: 15,
                    controls: {
                        attribution: false,
                        navigator: false,
                        zoom: false
                    },
                    layers: [{
                        type: "tile",
                        urlTemplate: "http://#= subdomain #.tile.openstreetmap.org/#= zoom #/#= x #/#= y #.png",
                        subdomains: ["a", "b", "c"],
                        attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap contributors</a>"
                    }],
                    markers: [{
                        location: [lat, lng],
                        shape: "pinTarget",
                        tooltip: { content: data.name }
                    }]
                });
                //$("#map").data("kendoMap").resize(true);
            });
        }
    }
}

define([
    'text!views/location/location.html'
], template => {
    var vm = new hfc.locationvm();
    var view = new kendo.View(template, {
        model: vm,
        show() { hfc.common.animate(this.element); },
        init() { vm.init(); }
    });
    return view;
});