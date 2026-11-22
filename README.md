# Candidate & Vacancy Ranking API

NestJS + Fastify + TypeORM + PostgreSQL 18 + Redis 8. Node.js 24.

## Features

- Candidate CRUD; email is unique.
- Vacancy CRUD with at least one criteria (age, gender, salary).
- Criteria weight defaults to `1`.
- Weighted ranking: a matched criteria contributes its weight.
- Ranking sorted descending; candidates with score 0 are included.
- Criteria evaluator registry makes new criteria easy to add.
- Vacancy criteria cached in Redis (TTL configurable; default 300 seconds).
- Criteria cache invalidated after vacancy update/delete.
- Candidate/vacancy list pagination.
- Unit test for Salary evaluator.

## Run with Docker

1. Copy `.env.example` to `.env`.
2. `docker compose up --build`
3. API base URL: `http://localhost:3000/api`

> `DB_SYNC=true` is enabled for local coding-test convenience. For production use migrations and set `DB_SYNC=false`.

## Run locally

1. Ensure PostgreSQL 18 and Redis 8 are running.
2. `cp .env.example .env`
3. `npm install`
4. `npm run start:dev`

## API endpoints

### Candidates

- `POST /api/candidates`
- `GET /api/candidates?page=1&limit=20`
- `GET /api/candidates/:id`
- `PATCH /api/candidates/:id`
- `DELETE /api/candidates/:id`

Candidate example:

```json
{
  "name": "Budi",
  "email": "budi@example.com",
  "birthday": "1998-03-20",
  "gender": "male",
  "currentSalary": 6000000
}
```

### Vacancies

- `POST /api/vacancies`
- `GET /api/vacancies?page=1&limit=20`
- `GET /api/vacancies/:id`
- `PATCH /api/vacancies/:id`
- `DELETE /api/vacancies/:id`

Vacancy example:

```json
{
  "name": "Backend Developer",
  "criteria": [
    { "type": "age", "details": { "min": 22, "max": 30 }, "weight": 3 },
    { "type": "gender", "details": { "value": "any" }, "weight": 1 },
    {
      "type": "salary",
      "details": { "min": 4500000, "max": 6500000 },
      "weight": 5
    }
  ]
}
```

Criterion types: `age`, `gender`, `salary`. Gender value: `male`, `female`, or `any`. If weight omitted, it defaults to 1.

### Ranking

- `GET /api/vacancies/:id/ranking?page=1&limit=20`

Example response:

```json
{
  "vacancyId": "...",
  "vacancyName": "Backend Developer",
  "maxScore": 6,
  "data": [
    {
      "candidateId": "...",
      "name": "Putri Maharani",
      "email": "putri@gmail.com",
      "score": 6,
      "maxScore": 6,
      "percentage": 100,
      "criteriaDetails": [
        {
          "type": "age",
          "weight": 2,
          "candidateValue": 30,
          "requirement": {
            "min": 21,
            "max": 35
          },
          "matched": true,
          "earnedScore": 2
        },
        {
          "type": "gender",
          "weight": 1,
          "candidateValue": "female",
          "requirement": {
            "value": "any"
          },
          "matched": true,
          "earnedScore": 1
        },
        {
          "type": "salary",
          "weight": 3,
          "candidateValue": 9000000,
          "requirement": {
            "min": 5000000,
            "max": 15000000
          },
          "matched": true,
          "earnedScore": 3
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

## Extending criteria

Implement `CriteriaEvaluator` with a `type` and `evaluate()` method, then register it in `RankingModule`'s evaluator provider array. The database schema does not need another column or migration for a new criteria type because criteria details are stored in JSONB.

## Scalability notes

For a coding-test-sized dataset, ranking is synchronous and reads the required candidate columns only. Ranking pagination is applied after globally calculating and sorting all scores. For large data, consider SQL-based scoring, keyset/batched processing with persisted scores, or asynchronous jobs. Chunking alone cannot produce a correct global page without merging/sorting all batch scores. Redis caches vacancy criteria, not candidate rankings, avoiding ranking-cache invalidation when candidate data changes.

## Logging

Ranking logs start/completion and total count/duration; errors include vacancy ID. No per-candidate logs are written.
