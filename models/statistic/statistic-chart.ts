import { StatisticKeyValueData } from '../index'

export class StatisticChart {
    headingKey: string;
    headingValue: number;
    headingValueIsPrice: boolean;
    points: Array<StatisticKeyValueData>;
    xAxisLabel: string;
}
