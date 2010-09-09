/*
---

name: Table.Sortable.js

description: Gives tables a sortable behavior

license: MIT-style license.

author: Stian Didriksen <stian@nooku.org>

copyright: Copyright needs to be Timble CVBA. (http://www.timble.net) All rights reserved.

requires: [Drag.Sortable]

provides: Table.Sortable

...
*/

if (!$chk(Table)) var Table = {};

Table.Sortable = new Class({

	Extends: Drag.Sortable,

	options: {
		offset: 2,
		zebra: true,
		
		onSort: function(){

			this.clone.inject(this.element, 'before');
			this.ghost.inject(this.element, 'after');
	
		},
		
		onComplete: function(){

			this.ghost.destroy();

		}
	},

	start: function(event, element){

		this.parent(event, element);

		this.ghost = this.getClone(new Event, element);
		this.ghost.inject(this.element, 'after');

	},

});

Element.implement({

	sortable: function(options){

		if(!this.$sortable) this.$sortable = this.get('tag') == 'tbody' ? new Table.Sortable(this, options) : new Drag.Sortable(this, options);

		return this.$sortable;

	}

});