var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../scripts/typings/require.d.ts" />
/// <reference path="../../scripts/typings/jquery.d.ts" />
/// <reference path="../../scripts/typings/kendo.all.d.ts" />
/// <reference path="../../scripts/common.ts" />
var hfc;
(function (hfc) {
    var centervm = (function (_super) {
        __extends(centervm, _super);
        function centervm() {
            _super.apply(this, arguments);
        }
        centervm.prototype.doAction = function (e) {
            if (e.id === "edit") {
                // popup a dialog box to edit the value
                $("#editCenterPanel").data("kendoWindow").open().center();
            }
        };
        centervm.prototype.closeButtonClick = function (e) {
            // Save the record
            var clone = JSON.parse(JSON.stringify(this.get("item"))); // cheap way to get a deep clone
            delete clone.favorite; // remove this property
            clone.lastModified = new Date().toISOString();
            // common.log("saving center data " + JSON.stringify(clone));
            var ref = new Firebase(hfc.common.FirebaseUrl);
            ref.child(this.get("refpath")).update(clone, function (error) {
                if (error) {
                    hfc.common.errorToast("Data could not be saved." + error);
                }
                else {
                    hfc.common.successToast("Center saved successfully.");
                    $("#editCenterPanel").data("kendoWindow").close();
                }
            });
        };
        centervm.prototype.setup = function (item, refpath) {
            this.set("item", item);
            this.set("refpath", refpath);
        };
        centervm.prototype.init = function () {
        };
        return centervm;
    })(kendo.data.ObservableObject);
    hfc.centervm = centervm;
})(hfc || (hfc = {}));
define([
    'text!views/center/center.html'
], function (template) {
    var vm = new hfc.centervm();
    var view = new kendo.View(template, {
        model: vm,
        show: function () { hfc.common.animate(this.element); },
        init: function () { vm.init(); }
    });
    return view;
});
//# sourceMappingURL=center.js.map