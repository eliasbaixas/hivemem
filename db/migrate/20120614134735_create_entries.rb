class CreateEntries < ActiveRecord::Migration
  def change
    create_table :entries do |t|
      t.string :text
      t.date :date
      t.string :topic
      t.string :tags

      t.timestamps
    end
  end
end
