/*
---

name: Drag.Sortable.js

description: Improves the native sortables class

license: MIT-style license.

author: Stian Didriksen <stian@nooku.org>

copyright: Copyright needs to be Timble CVBA. (http://www.timble.net) All rights reserved.

requires: [Sortables]

provides: Drag.Sortable

...
*/

Drag.Sortable = new Class({

	Extends: Sortables,

	options: {
		revert: true,
		clone: true,
		fx: {
			duration: 300,
			transition: Fx.Transitions.Sine.easeInOut,
			from: {
				opacity: [1, 0.6]
			},
			to: {
				opacity: 1
			}
		},
		converter: false,
		adapter: {
			type: 'cookie',
			options: {}
		},


		onStart: function(element, ghost){

			//@TODO Use css class instead
			element.setStyle('opacity', 0);
			
			//Saves the element being dragged
			this.dragged = element;
			
		},
		onComplete: function(element){

			var key = this.lists.indexOf(this.list);

			this.adapters[key].store(this, this.serialize(key));

		}
		
	},

	initialize: function(lists, options){

		this.parent(lists, options);

		this.adapters = [];
		this.lists.each(function(list, key){
			list.getChildren().each(function(row, i){
				row.setProperty('data-order', i);
			}, this);
			
			var adapter = new Drag.Sortable.Adapter[this.options.adapter.type.capitalize()](this.options.adapter.options);
			adapter.retrieve(this, this.serialize(this.options.converter));
			this.adapters[key] = adapter;
		}, this);
		
	},

	getClone: function(event, element){

		var clone = this.parent(event, element);	
		
		clone.addClass('clone');

		return clone;

	},
	
	start: function(event, element){

		this.parent(event, element);	
		
		this.element.setStyle('opacity', 0);

		this.clone.set('morph', {duration: this.options.fx.duration, transition: this.options.fx.transition}).morph(this.options.fx.from);

	},

	reset: function(){

		this.element.set('opacity', this.opacity);

		this.parent();

	},

	end: function(){
		this.drag.detach();

		if (this.effect){
			var dim = this.element.getStyles('width', 'height');
			var pos = this.clone.computePosition(this.element.getPosition(this.clone.offsetParent));
			this.effect.element = this.clone;
			this.effect.start({
				top: pos.top,
				left: pos.left,
				width: dim.width,
				height: dim.height,
				opacity: this.opacity,
			}).chain(this.reset.bind(this));
		} else {
			this.reset();
		}
	},

	serialize: function(){
		var params = Array.link(arguments, {modifier: Function.type, index: $defined});
		var serial = this.lists.map(function(list){
			return list.getChildren().map(params.modifier || function(element){
				return this.elements.indexOf(element);
			}, this);
		}, this);

		var index = params.index;
		if (this.lists.length == 1) index = 0;
		return $chk(index) && index >= 0 && index < this.lists.length ? serial[index] : serial;
	}

});

Element.implement({

	sortable: function(options){

		if(!this.$sortable) this.$sortable = new Drag.Sortable(this, options);
		
		return this.$sortable;

	}

});


if (!$chk(Drag.Sortable.Adapter)) Drag.Sortable.Adapter = {};


Drag.Sortable.Adapter.Cookie = new Class({
	
	Extends: Hash.Cookie,

	initialize: function(options){

		return this.parent(options.name || 'order', options);

	},

	retrieve: function(instance, order){
		instance.lists.each(function(list){
			var sorted = list.getChildren().sort(function(a, b){
			
				order = ['a', 'b'].map(function(key){
					return this.adapter.get(this[key].getProperty('data-order'));
				}, {adapter: this, a: a, b: b});
				
				return order[0] - order[1];
				
			}.bind(this));
	
			list.adopt(sorted);
		}, this);

	},
	
	store: function(instance, order){
		
		order.each(function(order, index){
			this[order] = index;
		}, store = {});

		this.hash.extend(store);
		this.save();

	}

});

Drag.Sortable.Adapter.Request = new Class({

	Extends: Request,

	options: {
		url: window.location.pathname + window.location.search
	},

	initialize: function(options){

		this.parent(options);

	},

	retrieve: function(instance, order){
	
		// Do nothing yet

	},

	store: function(instance, order){

		if(typeof this.options.data != 'object') this.options.data = {};
		instance.lists[0].getChildren().each(function(item, index){
			offset = index - item.getProperty('data-order');
			if(offset !== 0) this.options.data[item.getProperty('data-id')] = offset;
		}, this);

		this.send();
	}

});

Drag.Sortable.Adapter.Koowa = new Class({

	Extends: Drag.Sortable.Adapter.Request,

	options: {
		method: 'post'
	},

	store: function(instance, order){

		instance.lists[0].getChildren().each(function(item, index){
			offset = index - item.getProperty('data-order');
			if(offset !== 0 && item == instance.dragged) {
				this.options.url += '&id[]='+item.getElement('[name^=id]').value;
				if(offset > 0) offset = '+'+offset;
				this.options.data += '&ordering='+offset;
				this.send();
			}
		}, this);

	}

});