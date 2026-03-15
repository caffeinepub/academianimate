import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  type Subject = {
    id : Nat;
    name : Text;
  };

  type Topic = {
    id : Nat;
    subjectId : Nat;
    title : Text;
    description : Text;
    keyPoints : [Text];
    category : Text;
  };

  module Topic {
    public func compare(t1 : Topic, t2 : Topic) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };
  };

  let subjects = Map.empty<Nat, Subject>();
  let topics = Map.empty<Nat, Topic>();
  let viewedTopics = Map.empty<Principal, Set.Set<Nat>>();

  public shared ({ caller }) func addSubject(id : Nat, name : Text) : async () {
    if (subjects.containsKey(id)) { Runtime.trap("Subject with this id already exists.") };

    let subject : Subject = {
      id;
      name;
    };
    subjects.add(id, subject);
  };

  public shared ({ caller }) func addTopic(
    id : Nat,
    subjectId : Nat,
    title : Text,
    description : Text,
    keyPoints : [Text],
    category : Text,
  ) : async () {
    if (topics.containsKey(id)) { Runtime.trap("Topic with this id already exists.") };
    if (subjects.get(subjectId) == null) { Runtime.trap("Subject does not exist.") };

    let topic : Topic = {
      id;
      subjectId;
      title;
      description;
      keyPoints;
      category;
    };
    topics.add(id, topic);
  };

  public query ({ caller }) func getAllSubjects() : async [Subject] {
    subjects.values().toArray();
  };

  public query ({ caller }) func getTopicsBySubject(subjectId : Nat) : async [Topic] {
    topics.values().toArray().filter(
      func(topic) { topic.subjectId == subjectId }
    );
  };

  public query ({ caller }) func getTopic(topicId : Nat) : async Topic {
    switch (topics.get(topicId)) {
      case (null) { Runtime.trap("Topic does not exist.") };
      case (?topic) { topic };
    };
  };

  public shared ({ caller }) func markTopicViewed(topicId : Nat) : async () {
    let currentViews = switch (viewedTopics.get(caller)) {
      case (null) {
        let newSet = Set.empty<Nat>();
        viewedTopics.add(caller, newSet);
        newSet;
      };
      case (?set) { set };
    };
    currentViews.add(topicId);
  };

  public query ({ caller }) func getViewedTopics() : async [Nat] {
    switch (viewedTopics.get(caller)) {
      case (null) { [] };
      case (?set) { set.toArray() };
    };
  };

  public query ({ caller }) func searchTopics(keyword : Text) : async [Topic] {
    topics.values().toArray().filter(func(topic) { topic.title.contains(#text keyword) });
  };
};
