interface ComplianceChild {
  id: number;
  name: string;
  active: boolean;
  tag_type: string;
  resource_id: number;
  resource_type: string;
  comment: string | null;
  root_id: number;
  parent_id: number | null;
  grand_parent_id: number | null;
  children: ComplianceChild[];
}

interface ComplianceData {
  id: number;
  name: string;
  active: boolean;
  tag_type: string;
  resource_id: number;
  resource_type: string;
  comment: string | null;
  root_id: number;
  parent_id: number | null;
  grand_parent_id: number | null;
  children: ComplianceChild[];
}

export const complianceData: ComplianceData[] = [
  {
    id: 42,
    name: "Areas of Compliance",
    active: true,
    tag_type: "Category",
    resource_id: 45,
    resource_type: "Pms::CompanySetup",
    comment: null,
    root_id: 42,
    parent_id: null,
    grand_parent_id: null,
    children: [
      {
        id: 43,
        name: "ISO 27001-2013",
        active: true,
        tag_type: "SubCategory",
        resource_id: 45,
        resource_type: "Pms::CompanySetup",
        comment: null,
        root_id: 42,
        parent_id: 42,
        grand_parent_id: null,
        children: [
          {
            id: 44,
            name: "Control",
            active: true,
            tag_type: "SubSubCategory",
            resource_id: 45,
            resource_type: "Pms::CompanySetup",
            comment: null,
            root_id: 42,
            parent_id: 43,
            grand_parent_id: 42,
            children: [
              {
                id: 43,
                name: "CTL-00598-Ana Organization",
                active: true,
                tag_type: "SubSubSubCategory",
                resource_id: 45,
                resource_type: "Pms::CompanySetup",
                comment: null,
                root_id: 42,
                parent_id: 42,
                grand_parent_id: null,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 55,
    name: "Labour Laws Compliance",
    active: true,
    tag_type: "Category",
    resource_id: 45,
    resource_type: "Pms::CompanySetup",
    comment: null,
    root_id: 42,
    parent_id: 42,
    grand_parent_id: null,
    children: [
      {
        id: 56,
        name: "Minimum Wages Act",
        active: true,
        tag_type: "SubCategory",
        resource_id: 45,
        resource_type: "Pms::CompanySetup",
        comment: null,
        root_id: 42,
        parent_id: 55,
        grand_parent_id: 42,
        children: [
          {
            id: 57,
            name: "Compliance Checklist",
            active: true,
            tag_type: "SubSubCategory",
            resource_id: 45,
            resource_type: "Pms::CompanySetup",
            comment: null,
            root_id: 42,
            parent_id: 56,
            grand_parent_id: 42,
            children: [],
          },
          {
            id: 58,
            name: "Payment Records",
            active: true,
            tag_type: "SubSubSubCategory",
            resource_id: 45,
            resource_type: "Pms::CompanySetup",
            comment: null,
            root_id: 42,
            parent_id: 56,
            grand_parent_id: 42,
            children: [],
          },
        ],
      },
      {
        id: 59,
        name: "Factories Act",
        active: true,
        tag_type: "SubCategory",
        resource_id: 45,
        resource_type: "Pms::CompanySetup",
        comment: null,
        root_id: 42,
        parent_id: 55,
        grand_parent_id: 42,
        children: [
          {
            id: 60,
            name: "Safety Measures",
            active: true,
            tag_type: "SubSubCategory",
            resource_id: 45,
            resource_type: "Pms::CompanySetup",
            comment: null,
            root_id: 42,
            parent_id: 59,
            grand_parent_id: 42,
            children: [],
          },
          {
            id: 61,
            name: "Working Hours",
            active: true,
            tag_type: "SubSubCategory",
            resource_id: 45,
            resource_type: "Pms::CompanySetup",
            comment: null,
            root_id: 42,
            parent_id: 59,
            grand_parent_id: 42,
            children: [],
          },
        ],
      },
      {
        id: 62,
        name: "Industrial Disputes Act",
        active: true,
        tag_type: "SubCategory",
        resource_id: 45,
        resource_type: "Pms::CompanySetup",
        comment: null,
        root_id: 42,
        parent_id: 55,
        grand_parent_id: 42,
        children: [
          {
            id: 63,
            name: "Dispute Resolution Mechanisms",
            active: true,
            tag_type: "SubSubCategory",
            resource_id: 45,
            resource_type: "Pms::CompanySetup",
            comment: null,
            root_id: 42,
            parent_id: 62,
            grand_parent_id: 42,
            children: [],
          },
        ],
      },
    ],
  },
];
