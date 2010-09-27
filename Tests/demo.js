window.addEvent('domready', function(){
	// We autogenerate a list on the fly
	var li = [];
	
	for (i = 1; i <= 5; i++) {
		li.push(new Element('li', {'data-id': i, text: 'Item #'+i}));
	}
	
	var ul = new Element('ul', {
		'class': 'myList'
	}).inject('sortables').adopt(li).sortable();
	
	// We autogenerate a table on the fly
	var tr = [], chars = 'abcdefghijklmnopgrstuvwxyz'.split('');
	
	for (i = 1; i <= 10; i++) {
		tr.push(new Element('tr', {'data-id': i}).adopt(
			new Element('td', {'class': 'handle', 'html': '&#9776;'}),
			new Element('td', {'html': i}),
			new Element('td').adopt(new Element('input', {type: 'checkbox'})),
			new Element('td', {text: 'Item #'+i}),
			new Element('td', {text: chars.shift()})
		));
	}
	
	$('rows').adopt(tr).sortable({handles: '.handle', adapter: {type: 'request'}, numcolumn: 'td:nth-child(2)'});
});