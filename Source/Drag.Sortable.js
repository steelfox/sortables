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
		
		onDragStart: function(element, ghost){
		
			//@TODO Use css class instead
			element.setStyle('opacity', 0);
			
			//Change the trash to the same element as the list, to avoid jumpy dragging
			this.trash.adopt(new Element(this.list.getTag()).adopt(ghost));
			
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
		
		return this.$sortable;

	}

});