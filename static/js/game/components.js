define(function (require) {

    'use strict';

    return {

        components: {

            position: {
                x: 0,
                y: 0,
                velocity: 0,
                dir: 0
            },

            visible: {
                sprite: null
            },

            powers: {
                move: 5,
                jump: 3,
                weapon: 5
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
                position: {
                    x: 100,
                    y: 100,
                },
                powers: {}
            },

            visible: {

            },

            enemy: {
                position: {
                    velocity: 1.5
                },
            },
        }
    };
});
