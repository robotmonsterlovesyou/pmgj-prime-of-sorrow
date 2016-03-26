define(function (require) {

    'use strict';

    //var Utils = require('../utils');
    var Fiberent = require('../libs/fiberent');
    var componentSetup = require('./components');
    var systemSetup = require('./systems');

    // World setup ----------------------------------------------

    var setupWorld = {
        new: function () {

            var world = new Fiberent(),
                components = componentSetup.components,
                templates = componentSetup.templates,
                systems = systemSetup,
                keys, k;

            keys = Object.keys(components);
            for (k = 0, length = keys.length; k < length; k += 1) {
                world.registerComponent(keys[k], components[keys[k]]);
            }

            keys = Object.keys(templates);
            for (k = 0, length = keys.length; k < length; k += 1) {
                world.registerTemplate(keys[k], templates[keys[k]]);
            }

            keys = Object.keys(systems);
            for (k = 0, length = keys.length; k < length; k += 1) {
                world.registerSystem(keys[k], systems[keys[k]]);
            }

            return world;
        },

        load: function () {

            var world = new Fiberent();

            return world;
        }
    };

    return setupWorld;
});
