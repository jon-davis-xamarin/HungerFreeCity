var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _this = this;
/// <reference path="scripts/typings/jquery.d.ts" />
/// <reference path="scripts/typings/kendo.all.d.ts" />
/// <reference path="scripts/typings/firebase.d.ts" />
/// <reference path="scripts/typings/require.d.ts" />
/// <reference path="scripts/common.ts" />
var hfc;
(function (hfc) {
    var appvm = (function (_super) {
        __extends(appvm, _super);
        function appvm() {
            var _this = this;
            _super.apply(this, arguments);
            this.loggedIn = false;
            this.ref = new Firebase(hfc.common.FirebaseUrl);
            this.showRegister = function (e) {
                _this.closePanel("#loginPanel");
                _this.showPanel("#registerPanel");
            };
            this.showLogin = function (e) {
                _this.closePanel("#forgotPanel");
                _this.closePanel("#registerPanel");
                _this.showPanel("#loginPanel");
            };
            this.saveFavorites = function () {
                var userId = _this.get("userId");
                var favRef = _this.ref.child("users").child(userId).child("favorites").ref();
                favRef.set(hfc.common.User.favorites);
            };
        }
        appvm.prototype.showPanel = function (id) {
            var p = $(id).data("kendoWindow");
            p.open();
            p.center();
        };
        appvm.prototype.closePanel = function (id) {
            $(id).data("kendoWindow").close();
        };
        appvm.prototype.showForgot = function (e) {
            this.closePanel("#loginPanel");
            this.showPanel("#forgotPanel");
        };
        appvm.prototype.logoff = function () {
            // Unauthenticate the client
            this.ref.unauth();
            hfc.common.User = null;
            this.setlogin();
        };
        appvm.prototype.validateEmail = function (email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        };
        appvm.prototype.registerButtonClick = function (e) {
            var _this = this;
            var email = this.get("email");
            var password = this.get("password");
            // validate registration
            if (email == null || !this.validateEmail(email)) {
                hfc.common.errorToast("Invalid email address: " + email);
                return;
            }
            if (password == null || password === "") {
                hfc.common.errorToast("Please provide a password");
                return;
            }
            this.ref.createUser({
                email: email,
                password: password
            }, function (error) {
                if (error) {
                    _this.showError(error);
                }
                else {
                    hfc.common.successToast("Successfully registered");
                    // close the registration panel
                    _this.closePanel("#registerPanel");
                    _this.loginButtonClick(e);
                }
            });
        };
        appvm.prototype.loginButtonClick = function (e) {
            var _this = this;
            // validate credentials
            this.ref.authWithPassword({
                email: this.get("email"),
                password: this.get("password")
            }, function (error, authData) {
                if (error) {
                    _this.showError(error);
                }
                else {
                    _this.getUserProfile(authData);
                    // close the login panel
                    _this.closePanel("#loginPanel");
                }
            });
        };
        appvm.prototype.resetPasswordButtonClick = function (e) {
            var _this = this;
            this.ref.resetPassword({
                email: this.get("email")
            }, function (error) {
                if (error) {
                    _this.showError(error);
                }
                else {
                    hfc.common.successToast("Password reset email sent successfully");
                    // close the reset password panel and show the login panel
                    _this.closePanel("#forgotPanel");
                }
            });
        };
        appvm.prototype.showError = function (error) {
            switch (error.code) {
                case "INVALID_EMAIL":
                    hfc.common.errorToast("The specified user account email is invalid.");
                    break;
                case "INVALID_PASSWORD":
                    hfc.common.errorToast("The specified user account password is incorrect.");
                    break;
                case "INVALID_USER":
                    hfc.common.errorToast("The specified user account does not exist.");
                    break;
                default:
                    hfc.common.errorToast("Error logging user in: " + error);
            }
        };
        appvm.prototype.routeChange = function (e) {
            // select the nav link based on the current route
            var active = this.nav.find("a[href=\"#" + e.url + "\"]").parent();
            // if the nav link exists...
            if (active.length > 0) {
                // remove the active class from all links
                this.nav.find("li").removeClass("active");
                // add the active class to the current link
                active.addClass("active");
            }
        };
        appvm.prototype.getUserProfile = function (authData) {
            var _this = this;
            if (authData) {
                // get the user's profile data
                this.set("userId", authData.uid);
                var uref = this.ref.child("users").child(authData.uid).ref();
                uref.once("value", function (userData) {
                    var data = userData.val() || {
                        userId: authData.uid,
                        email: authData.password.email,
                        favorites: []
                    };
                    var mod = false;
                    if (data.userId === undefined) {
                        data.userId = authData.uid;
                        mod = true;
                    }
                    if (data.email === undefined) {
                        data.email = authData.password.email;
                        mod = true;
                    }
                    if (data.favorites === undefined) {
                        data.favorites = [];
                        mod = true;
                    }
                    if (mod)
                        uref.set(data);
                    hfc.common.User = data;
                    _this.setlogin();
                });
            }
            else {
                // no auth data, so must not be logged in
                this.setlogin();
            }
        };
        appvm.prototype.setlogin = function () {
            if (hfc.common.User) {
                hfc.common.successToast("Welcome " + hfc.common.User.email);
                this.set("loggedIn", true);
                this.set("email", hfc.common.User.email);
                $.publish("loggedIn", [this.ref]);
            }
            else {
                this.set("loggedIn", false);
                //this.set('email', "");
                //this.set('password', "");
                hfc.common.successToast("Logged off");
                $.publish("loggedOff");
            }
        };
        appvm.prototype.init = function () {
            // cache a reference to the nav links element
            this.set("nav", $("#nav-links"));
            //ref.onAuth(authData => {    // NOT CALLED when the user is already authenticated and remembered
            //    // provider: authData.provider,
            //    // provider The authentication method used, in this case: password.  String  
            //    // uid A unique user ID, intended as the user's unique key across all providers.  String
            //    // token The Firebase authentication token for this session.  String  
            //    // auth The contents of the authentication token, which will be available as the auth variable within your Security and Firebase Rules.  Object  
            //    // expires A timestamp, in seconds since the UNIX epoch, indicating when the authentication token expires.  Number  
            //    // password An object containing provider-specific data.  Object  
            //    // password.email The user's email address.  String  
            //    // password.isTemporaryPassword Whether or not the user authenticated using a temporary password, as used in password reset flows.  Boolean  
            //    // password.profileImageURL The URL to the user's Gravatar profile image, which is retrieved from hashing the user's email. If the user does not have a Gravatar profile, then a pixelated face is used.  String  
            //    if (authData) {
            //        // save the user's profile into the database so we can list users,
            //        // use them in Security and Firebase Rules, and show profiles
            //        // TODO: don't overwrite when already exists!
            //        hfc.common.successToast('You have been authenticated!' + authData.uid);
            //    }
            //});
            // get the user's profile data
            this.getUserProfile(this.ref.getAuth());
            $.subscribe("saveFavorites", this.saveFavorites);
            $.subscribe("showLogin", this.showLogin);
            $.subscribe("showRegister", this.showRegister);
        };
        return appvm;
    })(kendo.data.ObservableObject);
    hfc.appvm = appvm;
})(hfc || (hfc = {}));
define([
    "kendo",
    "views/home/home",
    "views/manage/manage",
    "views/about/about"
], function (kendo, home, manage, about) {
    var vm = new hfc.appvm();
    kendo.bind("#applicationHost", vm);
    vm.init();
    var layout = new kendo.Layout("<div id=\"viewRoot\"/>", {
        show: function () { kendo.fx(_this.element).fade("in").duration(500).play(); },
    });
    // Setup the application router
    var router = new kendo.Router({
        init: function () { layout.render("#content"); },
        routeMissing: function (e) { hfc.common.errorToast("No Route Found" + e.url); },
        change: function (e) { vm.routeChange(e); } // whenever the route changes
    });
    // Add new routes here...
    router.route("/", function () { layout.showIn("#viewRoot", home); });
    router.route("/manage", function () { layout.showIn("#viewRoot", manage); });
    router.route("/about", function () { layout.showIn("#viewRoot", about); });
    $.subscribe("loggedIn", function () { router.navigate("/manage"); });
    $.subscribe("loggedOff", function () { router.navigate("/"); });
    return router;
});
//# sourceMappingURL=app.js.map