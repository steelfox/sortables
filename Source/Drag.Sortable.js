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

Drag.Sortable = Sortables.extend({

	options: {
		ghost: true,
		revert: true,
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


		onDragStart: function(element, ghost){
		
			//@TODO Use css class instead
			element.setStyle('opacity', 0);
			
			//Change the trash to the same element as the list, to avoid jumpy dragging
			this.trash.adopt(new Element(this.list.getTag()).adopt(ghost));
			
			//Give the trash a class so we can style it
			this.trash.addClass('ghost');

			ghost.effects({duration: this.options.fx.duration, transition: this.options.fx.transition}).start(this.options.fx.from);
		},
		onDragComplete: function(element, ghost){

			var pos = element.getPosition();
			
			if(this.options.revert) {
				this.options.fx.to.top	= pos.y;
				this.options.fx.to.left	= pos.x;
			}
			
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
	
	initialize: function(el, options){

		this.parent(el, options);

		this.list.getChildren().each(function(row, i){
			row.setProperty('data-order', i);
		}, this);

		this.adapter = new Drag.Sortable.Adapter[this.options.adapter.type.capitalize()](this.options.adapter.options);
		this.adapter.retrieve.attempt([this.serialize(this.options.converter)], this);
	},

	serialize: function(converter){
		return this.list.getChildren().map(converter || function(el){
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


Drag.Sortable.Adapter.Cookie = Hash.Cookie.extend({

	initialize: function(options){

		return this.parent(options.name || 'order', options);

	},

	retrieve: function(order){

		var sorted = this.list.getChildren().sort(function(a, b){
		
			order = ['a', 'b'].map(function(key){
				return this.adapter.get(this[key].getProperty('data-order'));
			}, {adapter: this.adapter, a: a, b: b});
			
			return order[0] - order[1];
			
		}.bind(this));

		this.list.adopt(sorted);

	},
	
	store: function(order){
		
		order.each(function(order, index){
			this[order] = index;
		}, store = {});

		this.adapter.extend(store);

	}

});

Drag.Sortable.Adapter.Ajax = Ajax.extend({

	options: {
		url: window.location.pathname + window.location.search
	},

	initialize: function(options){

		return this.parent(options.url || this.options.url, options);

	},

	retrieve: function(order){
	
		// Do nothing yet

	},

	store: function(order){

		var store = {};

		this.list.getChildren().each(function(item, index){
			offset = index - item.getProperty('data-order');
			if(offset !== 0) store[item.getProperty('data-id')] = offset;
		});

		this.adapter.request(store);
	}

});

Drag.Sortable.Adapter.Koowa = Drag.Sortable.Adapter.Ajax.extend({

	options: {
		method: 'post'
	},

	store: function(order){

		this.list.getChildren().each(function(item, index){
			offset = index - item.getProperty('data-order');
			if(offset !== 0) {
				this.url += '&id[]='+item.getElement('[name^=id]').value;
				this.options.data += '&order[]='+offset;
			}
		}, this.adapter);

		this.adapter.request();
	}

});