window.Item = Backbone.Model.extend({

    initialize: function(){
        this.set('time', new Date());
        // this.set('text', 'empty text');
        if(!this.get('tags'))
          this.set('tags', []);

        // parse tags from text
        var tags = this.get('tags');
        var txt = this.get('text');
        // var ptags = txt.match(/#\w+/g);
        // if(ptags){
        //   $.each(ptags, function(idx, ptag){
        //     tags = tags.concat([ptag]);
        //   });
        //   tags = _.uniq(tags);
        //   console.log(tags);
        //   this.set('tags', tags);
        // }

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
    
    autotag: function(text){
      console.log('in autotag: ' + text);
      match = text.match(/^\w+/);
        if(match){
          firstword = match[0].toLowerCase();
          if(firstword in projects){
            el = projects[firstword];
            text = text.replace(match + ' ', "<b style='color:" + el.color + "' title='" + el.title + "'>[" + el.name + '] </b>');
          }
        }
      return text;
    },

    settext: function(text){
      console.log('settext: ' + text);
      this.set('text', this.autotag(text));
      return this;
    },

    get_text_as_html: function(){
    txt = this.get('text');

    // check for project definition
    match = txt.match(/^\[(\w+)\]/);
    if(match){
      firstword = match[1].toLowerCase();
      $.each(projects, function(dix, el){
        if(el.name.toLowerCase() == firstword){
          txt = txt.replace(match[0] + ' ', "<b style='color:" + el.color + "' title='" + el.title + "'>[" + el.name + '] </b>');
          return false;
        }
      });
    }


    return txt.
      replace(/\s(#\w+)/g, ' <span class="label">$1</span>');
    }
      // .replace(/^(\[\w+\])/, '<b>$1</b>'); }

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
  url: 'entries',


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
        'change [contentEditable]': 'change'
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
      },

    change: function(){
      txt = $(this.el).find('[contentEditable]').text();
      if(txt){
        this.model.settext(txt);
        this.model.save();
      } else {// destroy
        console.log('destroy');
        this.model.destroy();
      }
    }

});

