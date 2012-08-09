window.Item = Backbone.Model.extend({

    initialize: function(){
        this.set('time', new Date());
        // this.set('text', 'empty text');
        if(!this.get('tags'))
          this.set('tags', []);

        // parse tags from text
        var tags = this.get('tags');
        var txt = this.get('text');
        var ptags = txt.match(/#\w+/g);
        if(ptags){
          $.each(ptags, function(idx, ptag){
            tags = tags.concat([ptag]);
          });
          tags = _.uniq(tags);
          console.log(tags);
          this.set('tags', tags);
        }

        this.set('satisfiesFilterAnd', true);
        this.set('satisfiesFilterOr', true);
    },

    checkFilter: function(){
      //TODO: fix filter
      // return true;

      // console.log('check filter (' + this.get('title') + ')')

      mytags = this.get('tags');
      satisfiesFilterAnd = true;
      satisfiesFilterOr = app.get('tagfilter').length === 0;


      $.each(app.get('tagfilter'), function(idx, tag){
        hastag = false;
        $.each(mytags, function(myidx, mytag){
          if(mytag==tag)
            hastag = true;
        });
        
        if(!hastag)
          satisfiesFilterAnd = false;
        else
          satisfiesFilterOr = true;
      });
      // if(satisfiesFilterAnd!=this.get('satisfiesFilterAnd'))
      //   this.set('satisfiesFilterAnd', satisfiesFilterAnd)
      // if(satisfiesFilterOr!=this.get('satisfiesFilterOr'))
      //   this.set('satisfiesFilterOr', satisfiesFilterOr)
      this.set('satisfiesFilterAnd', satisfiesFilterAnd, {silent:true});
      this.set('satisfiesFilterOr', satisfiesFilterOr, {silent:true});
      this.trigger('change');
    },
    
    get_text_as_html: function(){
    txt = this.get('text');

    // check for project definition
    firstword = txt.match(/^\w+/);
    if(firstword in projects){
      proj = projects[firstword];
      txt = txt.replace(firstword + ' ', "<b style='color:" + proj.color + "' title='" + proj.title + "'>[" + projects[firstword].name + '] </b>');
    }


    return txt.
      replace(/\s(#\w+)/g, '<span class="label">$1</span>').
      replace(/^(\[\w+\])/, '<b>$1</b>');
    }


    });

    
window.App = Backbone.Model.extend({
    initialize: function(){
      this.tagfilter = [];
    },

    change: function(){
      $.each(this.changed, function(change){
        switch(change){
          case 'tagfilter':
            items.filter();
            break;

        }
      });
    }
    });

window.app = new App({
      tagfilter: []
    });


window.Items = Backbone.Collection.extend({
  model: Item,
  url: 'entries.json',


  filter: function(){
        this.each(function(item){
          item.checkFilter();
        });
      }

  });

window.items = new Items();

window.ItemView = Backbone.View.extend({
    template: _.template($('#item-template').html()),
    tag: 'ul',
    className: 'unstyled',

    events: {
        // 'click': 'open'
    },

    initialize: function() {
        // _.bindAll(this, 'render');
        this.model.bind('change', this.render, this);
        this.model.bind('destroy', this.remove, this);

        $('#items').append(this.render().el);
    },

    render: function() {
        var data = this.model.toJSON();
        _.extend(data, {text_html:this.model.get_text_as_html()});

        // console.log('view render (' + this.model.get('title') + ')')
        $(this.el).html(this.template(data));
        return this;
    },

    open: function(){
        var tmpl = _.template($('#modal-template').html());
        $(tmpl(this.model.toJSON())).modal();
      }

});

