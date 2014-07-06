describe('Composer Controller', function() {
	var MyController = Composer.Controller.extend({
		elements: {
			'h1': 'title'
		},

		events: {
			'click h1': 'click_title'
		},

		clicked: false,

		init: function()
		{
			this.render();
		},

		render: function()
		{
			this.html('<h1>Mai title</h1><p>Lorum ippsem dollar sin amut or something</p><div class="gutter"></div>');
		},

		click_title: function()
		{
			this.clicked = true;
		}
	});

	it('can be instantiated properly', function() {
		var con = new MyController({param1: 'omg'});
		expect(con instanceof Composer.Controller).toBe(true);
		expect(con.param1).toBe('omg');
		expect(con.clicked).toBe(false);
		con.click_title();
		expect(con.clicked).toBe(true);
		expect(con.el.tagName.toLowerCase()).toBe('div');
		expect(con.title.tagName.toLowerCase()).toBe('h1');
	});

	it('can delegate events properly', function() {
		var con = new MyController();
		var title = con.title;
		expect(con.clicked).toBe(false);
		fire_click(title);
		expect(con.clicked).toBe(true);
	});

	it('properly merges elements/events when extending', function() {
		var Ext = MyController.extend({
			elements: { 'p': 'my_p' },
			events: { 'click p': 'click_p' },

			clicked_p: 0,

			init: function()
			{
				this.parent();
			},

			click_p: function()
			{
				this.clicked_p++;
			}
		});

		var ext = new Ext();
		expect(ext.clicked).toBe(false);
		expect(ext.clicked_p).toBe(0);
		expect(ext.elements['h1']).toBeDefined();
		expect(ext.elements['p']).toBeDefined();
		expect(ext.events['click h1']).toBeDefined();
		expect(ext.events['click p']).toBeDefined();
		expect(ext.events['click p.test']).toBeUndefined();

		fire_click(ext.my_p);
		fire_click(ext.my_p);
		expect(ext.clicked_p).toBe(2);
	});

	it('will properly manage bindings', function() {
		var model = new Composer.Model();
		var rendered = 0;
		var clicked = 0;
		var Manager = Composer.Controller.extend({
			model: false,

			init: function()
			{
				if(!this.model) return false;
				this.with_bind(this.model, 'click', this.click.bind(this));
				this.with_bind(this.model, 'change', this.render.bind(this));
			},

			render: function()
			{
				rendered++;
			},

			click: function()
			{
				clicked++;
			}
		});
		var con = new Manager({model: model});

		model.set({name: 'jello'});
		model.set({age: 27});
		model.trigger('click');

		expect(rendered).toBe(2);
		expect(clicked).toBe(1);

		con.release();

		model.set({ignoreme: 'yes'});
		model.trigger('click');

		expect(rendered).toBe(2);
		expect(clicked).toBe(1);
	});
});

