(function() {

    'use strict';

    // performance.now() shim --------------------------------------------------

    // server-friendly implementation
    //var performance = {};

    (function() {

        var nowOffset = Date.now(0);
        if (typeof process === 'object') {
            process.performance = process.performance || {};
            process.performance.now = function now() {
                return Date.now() - nowOffset;
            };
            performance.now = process.performance.now;
        } else {
            window.performance = window.performance || {};
            if (!window.performance.now) {
                window.performance.now = function now() {
                    return Date.now() - nowOffset;
                };
            }
            performance.now = window.performance.now;
        }
    }());

    // Fiberent.js v0.1.0 ////////////////////////////////////////////////////////

    /**
     * Creates a Fiberent object for your application. The Fiberent object allows you to easily manage an <a href="https://en.wikipedia.org/wiki/Entity_component_system">entity component system</a>, or "ECS".
     *
     * ```
     * var world = new Fiberent();
     * ```
     *
     * @constructor
     * @property {Object} entities Reference to all entites registered with the Fiberent object. These are indexed by ID.
     * @property {Object} components Reference to all components registered with the Fiberent object.
     * @property {Object} systems Reference to all systems registered with the Fiberent object.
     * @property {Object} templates Reference to all component templates registered with the Fiberent object.
     * @return {Object} New Fiberent object.
     * @api public
     */

    function Fiberent() {

        this.entities = {};
        this.components = {};
        this.systems = {};
        this.templates = {};
        this.lastID = 0;

        this.registerComponent('metrics', {
            name: '',
            spawnTime: 0
        });
    }

    /**
     * Registers a component with the Fiberent object. Components are modular sets of serializable properties that can be dynamically added to or removed from entities. Outputs a message to <code>console.info</code> if the component has already been registered.
     * ```
     * world.registerComponent('position', {
     *     visible: true,
     *     x: 0,
     *     y: 0,
     *     speed: 5
     * });
     * ```
     * @param {String} componentName The name of the new component
     * @param {Object} properties An associative array of properties with default values. An entitiy with this component will have its own unique set of property values.
     */

    Fiberent.prototype.registerComponent = function(componentName, properties) {

        if (this.components[componentName] === undefined) {
            this.components[componentName] = {
                factory: new Fiberent.ComponentFactory(componentName, properties),
                data: {}
            };
        } else console.info('Fiberent: Component \'' + componentName + '\' already registered');
    };

    /**
     * Predicate function that checks if a component name has been registered. Outputs a messgae to <code>console.info</code> if the name has not been registered.
     * @param {String} componentName The name of the component to check
     * @return {Boolean} <code>true</code> if the component <code>name</code> has been registered.
     * @api private
     */

    Fiberent.prototype.checkComponent = function(componentName) {

        if (this.components[componentName] === undefined) {
            console.info('Fiberent: was passed invalid component \'' + componentName + '\'');
            return false;
        } else return true;
    };

    /**
     * Registers a component template with the Fiberent object. Templates are exclusively used for quick and easy creation of groups of entities. Outputs a message to <code>console.info</code> if the template has already been registered.
     * ```
     * world.registerTemplate('ghost', {
     *     position: {},
     *     visible: { alpha: 0.4 }
     * });
    * ```
     * @param {String} templateName The name of the new template.
     * @param {Object} components An associative array of components and their properties. Specifying properties is optional, and allows you to override the default values for these components.
     */

    Fiberent.prototype.registerTemplate = function(templateName, components) {

        if (this.templates[templateName] === undefined) {
            this.templates[templateName] = components;
        } else console.info('Fiberent: Template \'' + templateName + '\' already registered');
    };

    /**
     * Creates one or more Fiberent.Entity objects. An associative array can be passed to the <code>options</code> parameter to immediately register the new entities with components or component templates. All entities are automatically registered to a built-in <code>metrics</code> component that has <code>name</code> and <code>spawnTime</code> properties.
     *
     * ```
     * var entity = world.createEntities(1);
     * ```
     * ```
     * var player = world.createEntities(1, {
     *    withComponents: ['position', 'visible', 'controllable']
     * });
     * ```
     * ```
     * var sharks = world.createEntities(5, {
     *     withTemplates: ['animal'],
     *     withComponents: ['aquatic']
     * });
     * ```
     *
     * @param {Integer} num The number of entities that will be created.
     * @param {Object} [options] An associative array with the following optional properties:<ul style="line-height: "><li>withComponents: an <code>Array</code> of components to apply to the new entities</li><li>withTemplates: an <code>Array</code> of component templates to apply to the new entities</li><li>withName: a string to apply to the new entities' <code>metrics.name</code> property</li></ul>
     * @return {Object} Array of Fiberent.Entity objects.
     * @api public
     */

    Fiberent.prototype.createEntities = function(num, options) {

        var newEntities = [],
            i, c, t, length;
        if (typeof num !== 'number') num = 1;
        for (i = 0; i < num; i += 1) {
            newEntities[i] = new Fiberent.Entity(this);
            newEntities[i].addComponent('metrics');
            newEntities[i].setProp('metrics', { spawnTime: performance.now()});

            if (typeof options === 'object') for (var opt in options) {
                for (var subOpt in options[opt]) {
                    if (opt === 'withTemplates') {
                        var template = this.templates[options[opt][subOpt]];
                        if (template !== undefined) {
                            for (var tc in template) {
                                newEntities[i].addComponent(tc);
                                newEntities[i].setProp(tc, template[tc]);
                            }
                        }
                    }
                    if (opt === 'withComponents') {
                        newEntities[i].addComponent(options[opt][subOpt]);
                    }
                    if (opt === 'withName') {
                        newEntities[i].setProp('metrics', { name: options[opt] });
                    }
                }
            }
            // entity constructor will automatically call getNextID() upon creation
            this.entities[newEntities[i].ID] = newEntities[i];
        }
        return newEntities;
    };

    /**
     * Destroys a Fiberent.Entity object.
     * ```
     * world.destroyEntity(17);
     * ```
     * ```
     * world.destroyEntity(bullet);
     * ```
     * @param {Integer|Object} entity Pass in either the ID of the entity or a reference to the entity object to be deleted.
     */

    Fiberent.prototype.destroyEntity = function(entity) {

        // assume id was passed in
        var id = entity;

        // check if it's an object
        if (typeof entity === 'object') id = entity.ID;

        // destroy components
        var keys = Object.keys(this.components);
        for (var c = 0, length = keys.length; c < length; c += 1) {
            this.entities[id].removeComponent(keys[c]);
        }
        // destroy entity
        delete this.entities[id];
    };

    /**
     * Retrieves a Fiberent.entity object by its ID value.
     * ```
     * var entity = world.getEntity(4);
     * ```
     * @param {Integer} id The ID of the entity to retrieve.
     * @return {Object} A Fiberent.Entity object. If the passed ID is invalid, <code>undefined</code> will be returned.
     */

    Fiberent.prototype.getEntity = function(id) {

        return this.entities[id];
    };

    /**
     * Executes a callback function for each registered entity. The entity is passed to the first parameter of the callback. An associative array can be passed to the <code>options</code> parameter to define multiple "filters", which specify the entities that will be processed.
     *
     * Use of filters is recommended where possible, to minimize execution time of this method. An entity must be included in ALL filters in order for it to be processed.
     * ```
     * // update the position of all entities that have 'position' and 'velocity' components
     * var entities = world.eachEntity(function (entity) {
     *     var pos = entity.getProp('position');
     *     var vel = entity.getProp('velocity');
     *     pos.x += vel.x;
     *     pos.y += vel.y;
     *     entity.setProp('position', pos);
     * }, { filterComponents: ['position', 'velocity'] });
     * ```
     * @param {Function} func The callback function that will be executed for each entity that is processed. This should take one argument, which the current entity is passed to.
     * @param {Object} [filters] An associative array with the following optional properties:<ul><li>filterIDs: an <code>Array</code> of entity IDs</li><li>filterComponents: an <code>Array</code> of component names</li><li>filterFunctions: an <code>Array</code> of predicate functions (the entity is passed to the first argument of each function, and will be processed by the callback if each function returns true)</li></ul>
     * @return {Array} Array of references to the entities that were processed.
     */

    Fiberent.prototype.eachEntity = function(func, filters) {

        if (filters === undefined) filters = {};

        var IDs = [],
            filterIDs = Array.isArray(filters.filterIDs) ? filters.filterIDs : [],
            filterFunctions = Array.isArray(filters.filterFunctions) ? filters.filterFunctions : [],
            filterComponents = [], // [{ name, length }]
            f, i, length;

        if (typeof func === 'function') {

            if (filters === undefined) IDs = Object.keys(this.entities);
            else {

                if (Array.isArray(filters.filterComponents)) {
                    for (var fc = 0; fc < filters.filterComponents.length; fc += 1) {
                        if (this.checkComponent(filters.filterComponents[fc])) {
                            var comp = {
                                name: filters.filterComponents[fc],
                                length: Object.keys(this.components[filters.filterComponents[fc]].data).length
                            };
                            filterComponents.push(comp);
                        }
                    }
                }

                filterIDs.sort(function(a, b) {
                    return a.length > b.length;
                });
                filterComponents.sort(function(a, b) {
                    return a.length > b.length;
                });

                // filter by IDs
                if (filterIDs.length > 0)
                    for (f = 0, length = filterIDs.length; f < length; f += 1) {
                        IDs.push(filterIDs[f].toString());
                    }

                // bind with component data array
                var componentCompare = function(ele, idx, arr) { return this[ele] !== undefined; };

                // filter by components
                if (filterIDs.length === 0 && filterComponents.length > 0) {
                    IDs = Object.keys(this.components[filterComponents[0].name].data);
                }
                for (f = 1, length = filterComponents.length; f < length; f += 1) {
                    IDs = IDs.filter(componentCompare, this.components[filterComponents[f].name].data);
                }

                // filter by functions
                if (filterComponents.length === 0 && filterIDs.length === 0) {
                    IDs = Object.keys(this.entities);
                }
                for (f = 0, length = filterFunctions.length; f < length; f += 1) {
                    i = 0;
                    while (i < IDs.length) {
                        if (filterFunctions[f](this.entities[IDs[i]])) i += 1;
                        else IDs.splice(i, 1);
                    }
                }
            }

            // perform function logic per entity
            // also convert IDs to integers for return value
            for (i = 0, length = IDs.length; i < length; i += 1) {
                func(this.entities[IDs[i]]);
                IDs[i] = IDs[i] | 0;
            }
        } else console.info('Fiberent: eachEntity() was not passed a callback function');

        return IDs;
    };

    /**
     * Registers a system with the Fiberent object. Systems represent the business logic that will process entities. They have immediate access to the Fiberent object, and they can be toggled on/off dynamically. Outputs a message to <code>console.info</code> if the system has already been registered.
     *
     * In Fiberent, systems are NOT registered with specific components or entities. Instead, the user makes <code>Fiberent.eachEntity()</code> calls in the system's update callback to control which entities are processed in each system. This give the system the ability to efficiently process different types of entities in different ways, as well as efficiently process code that is NOT entity-specific. You can also update systems within systems.
     * ```
     * world.registerSystem('updatePositions', function(world, gravity) {
     *     world.eachEntity(function (entity) {
     *         var pos = entity.getProp('position');
     *         var vel = entity.getProp('velocity');
     *         vel.y -= gravity;
     *         pos.x += vel.x;
     *         pos.y += vel.y;
     *         entity.setProp('position', pos);
     *     }, { filterComponents: ['position', 'velocity'] });
     *     // simple collision detection might go here
     * });
     * ```
     * @param {String} systemName The name of the new system.
     * @param {Function} updateLoop The callback function that will be executed whenever this system is updated. The Fiberent object is passed to the first argument of this function during execution. You may define any number of additional arguments for your callback function. Use <code>Fiberent.eachEntity()</code> in this function to access only the entities that the system cares about.
     */

    Fiberent.prototype.registerSystem = function(systemName, updateLoop) {

        if (this.systems[systemName] === undefined) {
            this.systems[systemName] = new Fiberent.System(this, updateLoop);
        } else console.info('Fiberent: System \'' + systemName + '\' already registered');

    };

    /**
     * Activates the named system. It will be processed when <code>Fiberent.updateSystem()</code> is called.
     *
     * Systems default to an active state when they are first registered, so there is no need to call this unless you are possibly deactivating the system elsewhere.
     * ```
     * world.activateSystem('playerInput');
     * ```
     * @param {String} systemName The name of the system to activate.
     */

    Fiberent.prototype.activateSystem = function(systemName) {

        if (this.systems[systemName] !== undefined) this.systems[systemName].activate();
    };

    /**
     * Deactivates the named system. This will put the system to sleep, and it will NOT be processed when <code>Fiberent.updateSystem()</code> is called.
     * ```
     * world.deactivateSystem('renderCamera');
     * ```
     * @param {String} systemName The name of the system to deactivate.
     */

    Fiberent.prototype.deactivateSystem = function(systemName) {

        if (this.systems[systemName] !== undefined) this.systems[systemName].deactivate();
    };

    /**
     * Processes the named system by executing its registered update callback, if the system is active. The Fiberent object will be passed to the first argument of the callback. Additional arguments will be passed through to the subsequent callback arguments. If the system is not active, the callback is not executed and this returns <code>null</code>.
     * ```
     * var gravity = 9.8 / ticksPerSecond;
     * world.updateSystem('updatePositions', gravity);
     * ```
     * @param {String} systemName The name of the system to update.
     * @param {Any} [args] Arguments to be passed to the update callback.
     * @return {Any} The return value of the update callback if the system is active, or <code>null</code> if the system is not active. <code>undefined</code> if the system name is invalid.
     */

    Fiberent.prototype.updateSystem = function(systemName, args) {

        var a = [ this ];
        for (var i = 1; i < arguments.length; i += 1) a[i] = arguments[i];
        if (this.systems[systemName] !== undefined)
            return this.systems[systemName].update.apply(this.systems[systemName], a);
        else return undefined;
    };

    /**
     * Returns a stringified representation of the data in the Fiberent object. This can be used for debugging purposes, or for saving the state of the object between sessions.
     * ```
     * world.JSON();
     * ```
     * @return {String} Stringified representation of the data in the Fiberent object. Note: Components, systems, or properties prefixed with <code>_</code> are omitted from the result.
     */

    Fiberent.prototype.JSON = function() {

        return JSON.stringify(this, function(key, value) {
            if (key[0] === '_') return undefined;
            else return value;
        }, 4);
    };

    Fiberent.prototype.getNextID = function() {

        this.lastID += 1;
        return this.lastID;
    };

    // Entity //////////////////////////////////////////////////////////////////

    /**
     * Creates a new Fiberent.Entity object. Production code should be using Fiberent.createEntity() instead of this constructor.
     * @param {String} fiberent Reference to the Fiberent object the entity will be registered to.
     * @return {Object}
     * @api private
     */

    Fiberent.Entity = function(fiberent) {

        this._Fiberent = fiberent;
        this.ID = fiberent.getNextID();
    };

    /**
     * Dynamically adds a new component to the entity. Passing the name of an existing component does nothing (an entity cannot have duplicate components).
     * ```
     * animal.addComponent('fur');
     * @param {String} componentName Name of the component to add.
     * @return {Object} Associative array of the new component's initalized properties (or of the existing component's properites). <code>undefined</code> if the component name is invalid.
     */

    Fiberent.Entity.prototype.addComponent = function(componentName) {

        if (this._Fiberent.checkComponent(componentName)) {
            var c = this._Fiberent.components[componentName];
            if (c.data[this.ID] === undefined) c.data[this.ID] = c.factory.create(this.ID);
            return c.data[this.ID];
        } else return undefined;
    };

    /**
     * Dynamically removes a component from the entity.
     * ```
     * player.removeComponent('invulnerable');
     * ```
     * @param {String} componentName Name of the component to remove.
     */

    Fiberent.Entity.prototype.removeComponent = function(componentName) {

        if (this._Fiberent.checkComponent(componentName) && this.hasComponent(componentName))
            delete this._Fiberent.components[componentName].data[this.ID];
    };

    /**
     * Predicate function that checks if the entity has the named component.
     * ```
     * if (animal.hasComponent('aquatic') console.log('The animal can swim!'));
     * ```
     * @param {String} componentName Name of the component to check.
     * @return {Boolean} <code>true</code> if the entity has the named component.
     */

    Fiberent.Entity.prototype.hasComponent = function(componentName) {

        if (this._Fiberent.checkComponent(componentName)) return this._Fiberent.components[componentName].data[this.ID] !== undefined;
        else return false;
    };

    /**
     * Retrieves an associative array of a component's properties and values.
     * ```
     * for animal in animals {
     *     var pos = animal.getProp('positon');
     *     console.log(animal.getProp('info').name + '(' + pos.x + ',' + pos.y + ')');
     * };
     * ```
     * @param {String} componentName Name of the component to retrieve.
     * @return {Object} Associative array of the component's properties. <code>undefined</code> if the component name is invalid.
     */

    Fiberent.Entity.prototype.getProp = function(componentName) {

        if (this._Fiberent.checkComponent(componentName)) return this._Fiberent.components[componentName].data[this.ID];
        else return undefined;
    };

    /**
     * Sets one or more properties of an entity's component.
     * ```
     * for shark in sharks { shark.setProp('position', {'x': 230, 'z': -20}); }
     * ```
     * @param {String} componentName Name of the component to set properties for.
     * @param {Object} properties Associative array of properties to set.
     * @return {Object} Associative array of the component's properties. <code>undefined</code> if the component name is invalid.
     */

    Fiberent.Entity.prototype.setProp = function(componentName, properties) {

        if (this._Fiberent.checkComponent(componentName)) {
            var component = this._Fiberent.components[componentName].data[this.ID];
            if (component) {
                component.setProp(properties);
                return this._Fiberent.components[componentName].data[this.ID];
            } else return undefined;
        } else return undefined;
    };

    /**
     * Initializes an entity's component to its default state.
     * ```
     * entity.resetComponent('visible');
     * ```
     * @param {String} componentName Name of the component to reset.
     * @return {Object} Associative array of the component's properties. <code>undefined</code> if the component name is invalid.
     */

    Fiberent.Entity.prototype.resetComponent = function(componentName) {

        if (this._Fiberent.checkComponent(componentName)) {
            this.removeComponent(componentName);
            return this.addComponent(componentName);
        } else return undefined;
    };

    // Component ///////////////////////////////////////////////////////////////

    /**
     * @param {String} name
     * @param {Object} prop
     * @api private
     */

    Fiberent.ComponentFactory = function(name, prop) {
        this.name = name;
        this.prop = prop;
    };

    /**
     * @param {String} name
     * @api private
     */

    Fiberent.ComponentFactory.prototype.create = function(entityID) {
        var component = new Fiberent.Component(this.name, entityID);
        component.setProp(this.prop);
        return component;
    };

    /**
     * @param {String} name
     * @param {Integer} entityID
     * @api private
     */

    Fiberent.Component = function(name, entityID) {

        this._name = name;
        this.entityID = entityID;
        this.active = true;
    };

    // helper method for traversing a sub-property container?

    /**
     * @param {Object} property
     * @param {Function} func
     * @api private
     */

    Fiberent.Component.prototype.eachSubProperty = function(property, func) {

        var keys = Object.keys(this[property]);
        for (var i = 0, length = keys.length; i < length; i += 1) {
            func(keys[i], this[property][keys[i]]);
        }
    };

    // Cyclic structures will cause an infinite recursion.
    // Componenets are intended to be serializable.
    // If you MUST store functions as data in a component,
    //   use a variable starting with an underscore, but note that
    //   names with an underscore will NOT be stringified.
    // If you must store complex or cyclic objects, consider storing by
    //   an ID value instead of referencing the object (example: Fiberent.Entity).

    /**
     * @param {Object} properties
     * @api private
     */

    Fiberent.Component.prototype.setProp = function(properties) {

        if (properties !== undefined) {
            /*var keys = Object.keys(properties);
            for (var i = 0, length = keys.length; i < length; i += 1) {
                if (keys[i] !== '_name') {
                    this[keys[i]] = properties[keys[i]];
                }
            }*/
            this._deepExtend(this, properties);
        }
    };

    /**
     * @param {Object} destination
     * @param {Object} source
     * @api private
     */

    Fiberent.Component.prototype._deepExtend = function(destination, source) {

        var keys = Object.keys(source);
        for (var i = 0, length = keys.length; i < length; i += 1) {
            var property = keys[i];
            if (source[property] && source[property].constructor &&
                source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                this._deepExtend(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    };


    // System //////////////////////////////////////////////////////////////////

    /**
     * Creates a Fiberent.System object. Production code should be using Fiberent.registerSystem() instead of this constructor.
     * @param {Object} fiberent Reference to the Fiberent object this will be registerd to.
     * @param {Function} updateLoop Update callback that will be executed when this system is updated.
     * @api private
     */

    Fiberent.System = function(fiberent, updateLoop) {

        this._Fiberent = fiberent;
        this._update = updateLoop;
        this.active = true;
    };

    /**
     * Activate the system. This system will be processed when it is asked to update. Production code should be using Fiberent.activateSystem() instead of this method.
     * @api private
     */

    Fiberent.System.prototype.activate = function() {

        this.active = true;
    };

    /**
     * Deactivate the system. This will put the system to sleep, and it will NOT be processed when it is asked to update. Production code should be using Fiberent.deactivateSystem() instead of this method.
     * @api private
     */

    Fiberent.System.prototype.deactivate = function() {

        this.active = false;
    };

    /**
     * Processes the system by running its registered update callback. Production code should be using Fiberent.updateSystem() instead of this method.
     * @api private
     *
     * @param {Any} [args] Arguments to be passed to the update callback.
     * @return {Any} The return value of the update callback.
     */

    Fiberent.System.prototype.update = function(args) {

        if (this.active) return this._update.apply(this._Fiberent, arguments);
        else return null;
    };

    // AMD Support

    if (typeof define === 'function' && define.amd !== undefined) {
        define([], function() {
            return Fiberent;
        });
    } else if (typeof module === 'object' && module.exports !== undefined) {
        module.exports = Fiberent;
    } else {
        window.Fiberent = Fiberent;
    }

}());
