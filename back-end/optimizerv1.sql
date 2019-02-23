ALTER TABLE reports add unique(primaryid);
ALTER TABLE demo ADD FOREIGN KEY (primaryid) REFERENCES reports(primaryid);
ALTER TABLE outc ADD FOREIGN KEY (primaryid) REFERENCES reports(primaryid);
ALTER TABLE ther ADD FOREIGN KEY (primaryid) REFERENCES reports(primaryid);
ALTER TABLE rpsr ADD FOREIGN KEY (primaryid) REFERENCES reports(primaryid);
ALTER TABLE drug ADD FOREIGN KEY (primaryid) REFERENCES reports(primaryid);
ALTER TABLE reac ADD FOREIGN KEY (primaryid) REFERENCES reports(primaryid);

delete from cases where user_id=72;#for some reason, the previous MQP added some random cases not attached to any users. Delete these to satisfy the Unique constraint
ALTER TABLE users add unique(user_id);#create the unique constraint
ALTER TABLE cases ADD FOREIGN KEY (user_id) REFERENCES users(user_id); #create the foreign key now. Multiple cases map to one user.