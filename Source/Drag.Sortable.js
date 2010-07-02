/*
---

name: Sortables.js

description: Drag and drop sorting of lists

license: MIT-style license.

author: Stian Didriksen <stian@nooku.org>

copyright: Copyright needs to be Timble CVBA. (http://www.timble.net) All rights reserved.

requires: [Class]

provides: Sortables

...
*/

Drag.Sortable = Sortables.extend({

	options: {
		url: '#',
		onStart: Class.empty,
		onComplete: Class.empty,
		ghost: true,
		revert: true,
		snap: 3,
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
		
		onDragStart: function(element, ghost){
		
			//@TODO Use css class instead
			element.setStyle('opacity', 0);
			
			ghost.effects({duration: this.options.fx.duration, transition: this.options.fx.transition}).start(this.options.fx.from);
		},
		onDragComplete: function(element, ghost){
					
			ghost.element = element;
			ghost.options = this.options;
			ghost.trash = this.trash;
			
			pos = element.getPosition();
			ghost.removeClass('animate');
			
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
		},
		
		onOrderChange: function(order){
			console.log(order);
				form = $(this.options.form);
					var success = this.options.msg.success;
					$(this.options.form).send({
					data: {
						action: 'order',
						ordering: Json.toString(order),
						_token: $(this.options.form).getElement('input[name="_token"]').getValue()
					}
				});	
		}
	},

	serialize: function(converter){
		i = 0;
		return this.list.getChildren().filterByClass('sortable').map(converter || function(el){
			index = this.elements.indexOf(el);
			return {id:this.elements[index].getElement('input[name^="id"]').value,ordering:(i++)};
		}, this);
	}

});

Element.extend({

	sortable: function(options){

		if(!this.$sortable) this.$sortable = new Drag.Sortable(this, options);
		
		console.group('new Drag.Sortable  ', new Date().toTimeString());
		console.log(this, this.$sortable);
		console.groupEnd();

		return this.$sortable;

	}

});