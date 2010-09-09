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
			console.log(element, ghost, this.ghost, {duration: this.options.fx.duration, transition: this.options.fx.transition}, this.options.fx.from);
			//Change the trash to the same element as the list, to avoid jumpy dragging
			this.trash.adopt(new Element(this.list[0].get('tag')).adopt(ghost));
			
			//Give the trash a class so we can style it
			this.trash.addClass('ghost');

			this.clone.effects({duration: this.options.fx.duration, transition: this.options.fx.transition}).start(this.options.fx.from);
		},
		onComplete: function(element, ghost){

			var pos = element.getPosition();
			
			//if(this.options.revert) {
				this.options.fx.to.top	= pos.y;
				this.options.fx.to.left	= pos.x;
			//}
			
			ghost.effects({
				duration: this.options.fx.duration,
				transition: this.options.fx.transition,
				onComplete: function(element, ghost){

					this.trash.remove();

					//@TODO Use css class instead
					element.setStyle('opacity', 1);

				}.pass([element, ghost], this)
			}).start(this.options.fx.to);
			
			this.adapter.store.attempt([this.serialize(this.options.converter)], this);
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
			adapter.retrieve.attempt([this.serialize(this.options.converter)], this);
			this.adapters[key] = adapter;
		}, this);

		
	},

	getClone: function(event, element){

		var clone = this.parent(event, element);	
		
		console.warn(clone);

		return clone;

	},

	serialize: function(converter){
		//@TODO add support for lists asap
		return this.lists[0].getChildren().map(converter || function(el){
			return this.elements.indexOf(el);
		}, this);
	}

});

Element.extend({

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

	retrieve: function(order){
		this.lists.each(function(list){
			var sorted = list.getChildren().sort(function(a, b){
			
				order = ['a', 'b'].map(function(key){
					return this.adapter.get(this[key].getProperty('data-order'));
				}, {adapter: this.adapter, a: a, b: b});
				
				return order[0] - order[1];
				
			}.bind(this));
	
			list.adopt(sorted);
		}, this);

	},
	
	store: function(order){
		
		order.each(function(order, index){
			this[order] = index;
		}, store = {});

		this.adapter.extend(store);

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

	retrieve: function(order){
	
		// Do nothing yet

	},

	store: function(order){

		var store = {};

		this.list[0].getChildren().each(function(item, index){
			offset = index - item.getProperty('data-order');
			if(offset !== 0) store[item.getProperty('data-id')] = offset;
		});

		this.adapter.request(store);
	}

});

Drag.Sortable.Adapter.Koowa = Drag.Sortable.Adapter.Request.extend({

	options: {
		method: 'post'
	},

	store: function(order){

		this.list[0].getChildren().each(function(item, index){
			offset = index - item.getProperty('data-order');
			if(offset !== 0 && item == this.dragged) {
				this.adapter.url += '&id[]='+item.getElement('[name^=id]').value;
				if(offset > 0) offset = '+'+offset;
				this.adapter.options.data += '&ordering='+offset;
				this.adapter.request();
			}
		}, this);

	}

});