/// <reference path="scripts/typings/jquery.d.ts" />
/// <reference path="scripts/typings/kendo.all.d.ts" />
/// <reference path="scripts/typings/require.d.ts" />
/// <reference path="scripts/common.ts" />
require.config({
    paths: {
        'jQuery': 'scripts/jquery-2.1.4.min',
        'pubsub': 'scripts/pubsub',
        'bootstrap': 'scripts/bootstrap',
        'firebase': 'scripts/firebase',
        'text': 'scripts/text',
        'kendo': 'kendo',
        'common': 'scripts/common',
        'liveSetup': 'liveSetup',
        'live': 'scripts/live',
        'app': 'app'
    },
    shim: {
        'kendo': {
            deps: ['jQuery']
        },
        'pubsub': {
            deps: ['jQuery']
        },
        'bootstrap': {
            deps: ['jQuery']
        },
        'live': {
            deps: ['liveSetup']
        },
        'common': {
            deps: ['jQuery', 'kendo']
        },
        'app': {
            deps: ['jQuery', 'kendo', 'common', 'pubsub', 'bootstrap', 'firebase', 'text', 'live']
        }
    }
});
define([
    'app'
], function (app) {
    app.start();
});
// Stop Form Submission of Enter Key Press
function stopRKey(evt) {
    var evt2 = (evt) ? evt : ((event) ? event : null);
    var node = (evt.target) ? evt2.target : ((evt2.srcElement) ? evt2.srcElement : null);
    if ((evt.keyCode == 13) && (node.type == "text")) {
        return false;
    }
    return true;
}
window.document.onkeypress = stopRKey;
//# sourceMappingURL=main.js.map