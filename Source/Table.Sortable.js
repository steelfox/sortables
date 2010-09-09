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

Table.Sortable = Drag.Sortable.extend({

	options: {
		offset: 2,
		onStart: function(element){

			var spacing = element.getParent().getParent().getStyle('border-spacing').split(' ')[0].toInt(), 
				cells = this.ghost.getChildren(), 
				table = new Element('table', {'class': 'ghost', 'style': 'border-spacing: ' + spacing + 'px 0px'}).adopt(this.ghost.getParent());
			
			//Change the trash to the same element as the list, to avoid jumpy dragging
			this.trash.adopt(table);

			//Copy the background
			this.ghost.setStyle('background-color', element.getStyle('background-color'));

			element.getChildren().each(function(cell, i){
				cells[i].setStyles({
					width: this.options._getOffsetSize(cell),
					height: this.options._getOffsetSize(cell, true),
					paddingTop: cell.getStyle('padding-top'),
					paddingRight: cell.getStyle('padding-right'),
					paddingBottom: cell.getStyle('padding-bottom'),
					paddingLeft: cell.getStyle('padding-left')
					/*padding: cell.getStyle('padding') this doesn't work for some reason */
				});
			}, this);
		},
		
		_getOffsetSize: function(cell, vertical){
			var keys = vertical ? ['y', 'top', 'bottom'] : ['x', 'left', 'right'];
			return cell.getSize().size[keys[0]] 
			- cell.getStyle('padding-'+keys[1]).toInt() 
			- cell.getStyle('padding-'+keys[2]).toInt();
		}
	}

});

Element.implement({

	sortable: function(options){

		if(!this.$sortable) this.$sortable = this.get('tag') == 'tbody' ? new Table.Sortable(this, options) : new Drag.Sortable(this, options);
		
		return this.$sortable;

	}

});