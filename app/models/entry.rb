class Entry < ActiveRecord::Base
  attr_accessible :date, :tags, :text, :topic, :published_at
end
