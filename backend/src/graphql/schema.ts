import { buildSchema } from 'graphql';
import { CaseModel } from '../models/Case';

export const schema = buildSchema(`
  type Case {
    id: ID!
    caseTitle: String!
    clientName: String!
    courtName: String!
    caseType: String!
    nextHearingDate: String!
    stage: String!
    notes: String
  }

  type Query {
    cases(search: String): [Case!]!
  }

  type Mutation {
    updateCaseStage(id: ID!, stage: String!): Case
  }
`);

export const root = {
  cases: async ({ search }: { search?: string }) => {
    const q: any = {};
    if (search) {
      const re = new RegExp(search, 'i');
      q.$or = [{ caseTitle: re }, { clientName: re }];
    }
    const docs = await CaseModel.find(q).sort({ nextHearingDate: 1 });
    return docs.map((d) => ({
      id: d._id.toString(),
      caseTitle: d.caseTitle,
      clientName: d.clientName,
      courtName: d.courtName,
      caseType: d.caseType,
      nextHearingDate: d.nextHearingDate.toISOString(),
      stage: d.stage,
      notes: d.notes,
    }));
  },
  updateCaseStage: async ({ id, stage }: { id: string; stage: string }) => {
    const updated = await CaseModel.findByIdAndUpdate(id, { stage }, { new: true });
    if (!updated) return null;
    return {
      id: updated._id.toString(),
      caseTitle: updated.caseTitle,
      clientName: updated.clientName,
      courtName: updated.courtName,
      caseType: updated.caseType,
      nextHearingDate: updated.nextHearingDate.toISOString(),
      stage: updated.stage,
      notes: updated.notes,
    };
  },
};
