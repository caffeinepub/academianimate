import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Topic {
    id: bigint;
    title: string;
    description: string;
    keyPoints: Array<string>;
    subjectId: bigint;
    category: string;
}
export interface Subject {
    id: bigint;
    name: string;
}
export interface backendInterface {
    addSubject(id: bigint, name: string): Promise<void>;
    addTopic(id: bigint, subjectId: bigint, title: string, description: string, keyPoints: Array<string>, category: string): Promise<void>;
    getAllSubjects(): Promise<Array<Subject>>;
    getTopic(topicId: bigint): Promise<Topic>;
    getTopicsBySubject(subjectId: bigint): Promise<Array<Topic>>;
    getViewedTopics(): Promise<Array<bigint>>;
    markTopicViewed(topicId: bigint): Promise<void>;
    searchTopics(keyword: string): Promise<Array<Topic>>;
}
