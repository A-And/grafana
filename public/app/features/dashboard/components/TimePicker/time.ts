import moment, { Moment } from 'moment';
import { TimeOption, TimeRange, TIME_FORMAT } from '@grafana/ui';

import * as dateMath from '../../../../../app/core/utils/datemath';
import { describeTimeRange } from '../../../../../app/core/utils/rangeutil';

export const mapTimeOptionToTimeRange = (
  timeOption: TimeOption,
  isTimezoneUtc: boolean,
  timezone?: string
): TimeRange => {
  const fromMoment = stringToMoment(timeOption.from, isTimezoneUtc, false, timezone);
  const toMoment = stringToMoment(timeOption.to, isTimezoneUtc, true, timezone);

  return { from: fromMoment, to: toMoment, raw: { from: timeOption.from, to: timeOption.to } };
};

export const stringToMoment = (value: string, isTimezoneUtc: boolean, roundUp?: boolean, timezone?: string): Moment => {
  if (value.indexOf('now') !== -1) {
    if (!dateMath.isValid(value)) {
      return moment();
    }

    return dateMath.parse(value, roundUp, timezone);
  }

  if (isTimezoneUtc) {
    return moment.utc(value, TIME_FORMAT);
  }

  return moment(value, TIME_FORMAT);
};

export const mapTimeRangeToRangeString = (timeRange: TimeRange): string => {
  return describeTimeRange(timeRange.raw);
};

export const isValidTimeString = (text: string) => dateMath.isValid(text);
