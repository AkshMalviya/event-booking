import { Injectable } from '@nestjs/common';
import { Model, PipelineStage } from 'mongoose';

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

interface IProps {
  model: Model<any>,
    aggregation: PipelineStage[],
    afterPagination?: PipelineStage[],
    page?: number,
    limit?: number,
}

@Injectable()
export class PaginationService {
  async aggregate<T>(
    props: IProps,
  ): Promise<PaginationResult<T>> {
    const { model, aggregation, afterPagination = [], page = 1, limit = 9 } = props
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline: PipelineStage[] = [
      ...aggregation,
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limitNum },
            ...afterPagination,
          ] as any,
        },
      },
    ];

    const [result] = await model.aggregate(pipeline).exec();

    const total = result.metadata[0]?.total || 0;
    const data = result.data;
    const hasNextPage = skip + limitNum < total;

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        hasNextPage,
      },
    };
  }
}
