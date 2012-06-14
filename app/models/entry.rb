class Entry < ActiveRecord::Base
  attr_accessible :date, :tags, :text, :topic
end
