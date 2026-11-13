export type GetCountriesKey =
    | [
          string,
          {
              pageNumber?: number;
              pageSize?: number;
              query?: string;
          },
      ]
    | null;
