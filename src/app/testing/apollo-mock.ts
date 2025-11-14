import { of } from 'rxjs';
import { ApolloQueryResult } from '@apollo/client/core';
import { QueryRef } from 'apollo-angular';

/**
 * Apollo testing utilities
 */

/**
 * Create a mock Apollo query result
 */
export function createApolloQueryResult<T>(data: T): ApolloQueryResult<T> {
  return {
    data,
    loading: false,
    networkStatus: 7,
  } as ApolloQueryResult<T>;
}

/**
 * Create a mock Apollo watchQuery response
 */
export function createMockWatchQueryResponse<T>(data: T): Partial<QueryRef<any, any>> {
  return {
    valueChanges: of(createApolloQueryResult(data)),
    refetch: jasmine.createSpy('refetch').and.returnValue(Promise.resolve(createApolloQueryResult(data))),
    fetchMore: jasmine.createSpy('fetchMore'),
    startPolling: jasmine.createSpy('startPolling'),
    stopPolling: jasmine.createSpy('stopPolling'),
    updateQuery: jasmine.createSpy('updateQuery')
  } as Partial<QueryRef<any, any>>;
}

/**
 * Create a mock Apollo service
 */
export function createMockApolloService() {
  return {
    watchQuery: jasmine.createSpy('watchQuery')
  };
}

/**
 * Create a mock Apollo QueryRef
 */
export function createMockQueryRef<T>(data: T) {
  return {
    valueChanges: of(createApolloQueryResult(data)),
    refetch: jasmine.createSpy('refetch').and.returnValue(Promise.resolve(createApolloQueryResult(data))),
    fetchMore: jasmine.createSpy('fetchMore'),
    startPolling: jasmine.createSpy('startPolling'),
    stopPolling: jasmine.createSpy('stopPolling'),
    updateQuery: jasmine.createSpy('updateQuery')
  };
}
