( function ( f, define ) {
	define( ['./kendo/2015.2.805/kendo.data.min'], f );
} )( function () {
	'use strict';

	var __meta__ = {
		id: 'data.firebase',
		category: 'data',
		name: 'Firebase',
		depends: ['data']
	};

	( function ( kendo, undefined ) {
		kendo.data.transports.firebase = kendo.data.RemoteTransport.extend( {
			create: function ( options ) {
				var data = this.parameterMap( options.data, 'create' );
				delete data.refkey;

				this.requestId = kendo.guid();

				var fbRef = this.ref.push( data, function ( error ) {
					if( error ) {
						options.fail();
					}
				} );

				if( fbRef !== undefined ) {
					var result = data;
					result.refkey = fbRef.key();	// was .name()
					options.success( result );
					delete this.requestId;
				}
			},

			destroy: function ( options ) {
				var data = this.parameterMap( options.data, 'update' );
				this.ref.child( data.refkey ).set( null, function ( error ) {
					if( !error ) {
						var result = data;
						result.refkey = data.refkey;
						options.success( result );
					} else {
						options.fail();
					}
				} );
			},

			init: function ( options ) {
				var firebase = options && options.firebase ? options.firebase : {};

				var url = firebase.url;
				if( !url ) {
					throw new Error( 'The URL must be set.' );
				}

				this.ref = new Firebase( url );
				kendo.data.RemoteTransport.fn.init.call( this, options );
			},

			push: function ( callbacks ) {
				this.ref.on( 'child_added', function ( childSnapshot, prevChildName ) {
					if( this.requestId !== undefined ) {
						return;
					}
					var model = childSnapshot.val();
					try {
						model.refkey = childSnapshot.key();
						callbacks.pushUpdate( model );
					}
					catch( ex ) { }
				}, function () { }, this );

				this.ref.on( 'child_changed', function ( childSnapshot, prevChildName ) {
					var model = childSnapshot.val();
					model.refkey = childSnapshot.key();
					callbacks.pushUpdate( model );
				} );

				this.ref.on( 'child_moved', function ( childSnapshot, prevChildName ) {
					var model = childSnapshot.val();
					model.refkey = childSnapshot.key();
					callbacks.pushUpdate( model );
				} );

				this.ref.on( 'child_removed', function ( oldChildSnapshot ) {
					var model = oldChildSnapshot.val();
					model.refkey = oldChildSnapshot.key();
					callbacks.pushDestroy( model );
				} );
			},

			read: function ( options ) {
				this.ref.once( 'value', function ( dataSnapshot ) {
					var data = [];
					dataSnapshot.forEach( function ( childSnapshot ) {
						var model = childSnapshot.val();
						model.refkey = childSnapshot.key();
						data.push( model );
					} );
					options.success( data );
				} );
			},

			update: function ( options ) {
				var refkey = options.data.refkey,
					data = this.parameterMap( options.data, 'update' );

				delete data.refkey;
				this.ref.child( refkey ).set( data, function ( error ) {
					if( !error ) {
						var result = data;
						result.refkey = refkey;
						options.success( result );
					} else {
						options.fail();
					}
				} );
			}
		} );
	} )( window.kendo );

	return window.kendo;

}, typeof define == 'function' && define.amd ? define : function ( _, f ) { f(); } );