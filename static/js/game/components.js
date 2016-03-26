define(function (require) {

    'use strict';

    return {

        components: {

            physical: {
                obj: null // facade object
            },

            visible: {},

            power: {
                strength: 100
            },

            shot: {
                type: 'pellet',
                source: 'player',
                power: null,
                hitDistance: Infinity,
                target: null,
                lifetime: null
            },
        },

        templates: {

            player: {
                physical: {},
                visible: {},
                powers: {}
            },

            platform: {
                physical: {},
                visible: {}
            },
            enemy: {
                physical: {},
                visible: {}
            }
        }
    };
});
