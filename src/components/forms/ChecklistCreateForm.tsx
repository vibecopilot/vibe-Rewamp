import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Settings, ClipboardList, Calendar, Plus, X, Users } from "lucide-react";
import FormSection from "../../components/ui/FormSection";
import FormInput from "../../components/ui/FormInput";
import FormGrid from "../../components/ui/FormGrid";
import FormToggle from "../../components/ui/FormToggle";
import { Button } from "../../components/ui/button";
import { getItemInLocalStorage } from "../../utils/localStorage";
import {
  getAssignedTo,
  getChecklistGroupReading,
  getVendors,
  getMasterChecklist,
  postChecklist,
} from "../../api";
import Select from "react-select";

interface Question {
  name: string;
  type: string;
  options: string[];
  value_types: string[];
  question_mandatory: boolean;
  reading: boolean;
  help_text: string;
  showHelpText: boolean;
  image_for_question: File[];
  weightage: string;
  rating: boolean;
}

interface Section {
  group: string;
  questions: Question[];
}

const ChecklistCreateForm: React.FC<{ checklistType?: "routine" | "ppm" }> = ({ checklistType = "routine" }) => {
  const navigate = useNavigate();
  const themeColor = useSelector((state: any) => state.theme.color);
  const siteId = getItemInLocalStorage("SITEID");
  const userId = getItemInLocalStorage("UserId");
  const categories = getItemInLocalStorage("categories") || [];

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState(formattedDate);
  const [endDate, setEndDate] = useState(formattedDate);
  const [supplierId, setSupplierId] = useState("");
  const [catId, setCatId] = useState("");
  const [assignId, setAssignId] = useState("");
  const [lockOverdueTask, setLockOverdueTask] = useState("");
  const [ticketType, setTicketType] = useState("Question");
  const [cronExpression, setCronExpression] = useState("0 0 * * *");
  
  const [createNew, setCreateNew] = useState(false);
  const [createTicket, setCreateTicket] = useState(false);
  const [weightage, setWeightage] = useState(false);

  const [submitDays, setSubmitDays] = useState(0);
  const [submitHours, setSubmitHours] = useState(0);
  const [submitMinutes, setSubmitMinutes] = useState(0);
  const [extensionDays, setExtensionDays] = useState(0);
  const [extensionHours, setExtensionHours] = useState(0);
  const [extensionMinutes, setExtensionMinutes] = useState(0);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [masters, setMasters] = useState<any[]>([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState<any[]>([]);
  const [supervisorOptions, setSupervisorOptions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sections, setSections] = useState<Section[]>([
    {
      group: "",
      questions: [
        {
          name: "",
          type: "",
          options: ["", "", "", ""],
          value_types: ["", "", "", ""],
          question_mandatory: false,
          reading: false,
          help_text: "",
          showHelpText: false,
          image_for_question: [],
          weightage: "",
          rating: false,
        },
      ],
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignedResp, sitesResp, suppliersResp, mastersResp] = await Promise.all([
          getAssignedTo(),
          getChecklistGroupReading(),
          getVendors(),
          getMasterChecklist(),
        ]);

        setAssignedUsers(assignedResp.data || []);
        setSupervisorOptions(
          assignedResp.data?.map((user: any) => ({
            value: user.id,
            label: `${user.firstname} ${user.lastname}`,
          })) || []
        );
        setSites(sitesResp.data || []);
        setSuppliers(suppliersResp.data || []);
        setMasters(
          mastersResp.data?.checklists?.map((check: any) => ({
            value: check.id,
            label: check.name,
          })) || []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const addSection = () => {
    setSections([
      ...sections,
      {
        group: "",
        questions: [
          {
            name: "",
            type: "",
            options: ["", "", "", ""],
            value_types: ["", "", "", ""],
            question_mandatory: false,
            reading: false,
            help_text: "",
            showHelpText: false,
            image_for_question: [],
            weightage: "",
            rating: false,
          },
        ],
      },
    ]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const addQuestion = (sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].questions.push({
      name: "",
      type: "",
      options: ["", "", "", ""],
      value_types: ["", "", "", ""],
      question_mandatory: false,
      reading: false,
      help_text: "",
      showHelpText: false,
      image_for_question: [],
      weightage: "",
      rating: false,
    });
    setSections(updated);
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].questions.splice(questionIndex, 1);
    setSections(updated);
  };

  const handleSectionChange = (index: number, value: string) => {
    const updated = [...sections];
    updated[index].group = value;
    setSections(updated);
  };

  const handleQuestionChange = (
    sectionIndex: number,
    questionIndex: number,
    field: string,
    value: any,
    optionIndex?: number
  ) => {
    const updated = [...sections];
    const question = { ...updated[sectionIndex].questions[questionIndex] };

    if (field === "option" && optionIndex !== undefined) {
      question.options[optionIndex] = value;
    } else if (field === "value_type" && optionIndex !== undefined) {
      question.value_types[optionIndex] = value;
    } else {
      (question as any)[field] = value;
    }

    updated[sectionIndex].questions[questionIndex] = question;
    setSections(updated);
  };

  const convertedSubmitMinutes = submitDays * 1440 + submitHours * 60 + submitMinutes;
  const convertedExtensionMinutes = extensionDays * 1440 + extensionHours * 60 + extensionMinutes;

  const handleSubmit = async () => {
    if (!name || !frequency) {
      return toast.error("Name and Frequency are required");
    }
    if (startDate >= endDate) {
      return toast.error("Start date must be before End date");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      formData.append("checklist[site_id]", siteId);
      formData.append("checklist[weightage_enabled]", String(weightage));
      formData.append("checklist[occurs]", "");
      formData.append("checklist[name]", name);
      formData.append("checklist[start_date]", startDate);
      formData.append("checklist[end_date]", endDate);
      formData.append("checklist[user_id]", userId);
      formData.append("checklist[cron_expression]", cronExpression);
      formData.append("checklist[grace_period]", String(convertedSubmitMinutes));
      formData.append("checklist[grace_period_unit]", String(convertedExtensionMinutes));
      formData.append("checklist[supplier_id]", supplierId);
      formData.append("checklist[lock_overdue]", String(lockOverdueTask === "true"));
      formData.append("checklist[ctype]", checklistType);
      formData.append("checklist[ticket_enabled]", String(createTicket));
      formData.append("checklist[ticket_level_type]", ticketType);
      formData.append("checklist[category_id]", catId);
      formData.append("assigned_to", assignId);
      formData.append("frequency", frequency);

      selectedSupervisors.forEach((option) => {
        formData.append("checklist[supervisior_id][]", option.value);
      });

      sections.forEach((section) => {
        formData.append("groups[][group]", section.group);
        section.questions.forEach((q, qIndex) => {
          formData.append("groups[][questions][][name]", q.name);
          formData.append("groups[][questions][][type]", q.type);
          formData.append("groups[][questions][][reading]", String(q.reading));
          formData.append("groups[][questions][][question_mandatory]", String(q.question_mandatory));
          formData.append("groups[][questions][][help_text_enbled]", String(q.showHelpText));
          formData.append("groups[][questions][][help_text]", q.help_text || "");
          formData.append("groups[][questions][][weightage]", q.weightage);
          formData.append("groups[][questions][][rating]", String(q.rating));

          q.options.forEach((option, optionIndex) => {
            formData.append("groups[][questions][][options][]", option || "");
            formData.append("groups[][questions][][value_types][]", q.value_types[optionIndex] || "");
          });

          q.image_for_question.forEach((file) => {
            formData.append(`groups[][questions][][image_for_question_${qIndex + 1}][]`, file);
          });
        });
      });

      await postChecklist(formData);
      toast.success("Checklist Created Successfully");
      navigate(checklistType === "ppm" ? "/assets/ppm" : "/assets/checklist");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create checklist");
    } finally {
      setIsSubmitting(false);
    }
  };

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ];

  const questionTypeOptions = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "radio", label: "Radio" },
    { value: "checkbox", label: "Checkbox" },
    { value: "date", label: "Date" },
    { value: "file", label: "File Upload" },
  ];

  const siteOptions = sites.map((s: any) => ({ value: String(s.id), label: s.name }));
  const supplierOptions = suppliers.map((s: any) => ({ value: String(s.id), label: s.name || s.vendor_name }));
  const categoryOptions = categories.map((c: any) => ({ value: String(c.id), label: c.name }));
  const assignedOptions = assignedUsers.map((u: any) => ({ value: String(u.id), label: `${u.firstname} ${u.lastname}` }));

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <FormSection title="Configuration" icon={Settings}>
        <div className="flex flex-wrap gap-6 mb-6">
          <FormToggle label="Create New" checked={createNew} onChange={setCreateNew} />
          <FormToggle label="Create Ticket" checked={createTicket} onChange={setCreateTicket} />
          <FormToggle label="Weightage" checked={weightage} onChange={setWeightage} />
        </div>

        {createNew && (
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-1.5 block">Select Template</label>
            <Select
              options={masters}
              placeholder="Select from existing template"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        )}
      </FormSection>

      {/* Basic Details */}
      <FormSection title="Basic Details" icon={ClipboardList}>
        <FormGrid columns={3}>
          <FormInput
            label="Checklist Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter Checklist Name"
          />
          <FormInput
            label="Category"
            name="category"
            type="select"
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
            options={categoryOptions}
            placeholder="Select Category"
          />
          <FormInput
            label="Supplier"
            name="supplier"
            type="select"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={supplierOptions}
            placeholder="Select Supplier"
          />
          <FormInput
            label="Frequency"
            name="frequency"
            type="select"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            options={frequencyOptions}
            required
            placeholder="Select Frequency"
          />
          <FormInput
            label="Start Date"
            name="start_date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <FormInput
            label="End Date"
            name="end_date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormGrid>
      </FormSection>

      {/* Assignment */}
      <FormSection title="Assignment" icon={Users}>
        <FormGrid columns={2}>
          <FormInput
            label="Assigned To"
            name="assigned_to"
            type="select"
            value={assignId}
            onChange={(e) => setAssignId(e.target.value)}
            options={assignedOptions}
            placeholder="Select Assignee"
          />
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Supervisors</label>
            <Select
              isMulti
              options={supervisorOptions}
              value={selectedSupervisors}
              onChange={(selected) => setSelectedSupervisors(selected as any[])}
              placeholder="Select Supervisors"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </FormGrid>

        <div className="mt-4">
          <label className="text-sm text-muted-foreground mb-2 block">Lock Overdue Task</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="lock_overdue"
                value="true"
                checked={lockOverdueTask === "true"}
                onChange={(e) => setLockOverdueTask(e.target.value)}
                className="accent-primary"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="lock_overdue"
                value="false"
                checked={lockOverdueTask === "false"}
                onChange={(e) => setLockOverdueTask(e.target.value)}
                className="accent-primary"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {createTicket && (
          <div className="mt-4">
            <label className="text-sm text-muted-foreground mb-2 block">Create Ticket At</label>
            <div className="flex gap-4">
              {["Question", "Checklist", "Section"].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ticket_type"
                    value={type}
                    checked={ticketType === type}
                    onChange={(e) => setTicketType(e.target.value)}
                    className="accent-primary"
                  />
                  <span>{type} Level</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </FormSection>

      {/* Grace Period */}
      <FormSection title="Grace Period" icon={Calendar}>
        <FormGrid columns={2}>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Submit Grace Period</label>
            <div className="flex gap-2">
              <FormInput
                label=""
                name="submit_days"
                type="number"
                value={submitDays}
                onChange={(e) => setSubmitDays(Number(e.target.value))}
                placeholder="Days"
              />
              <FormInput
                label=""
                name="submit_hours"
                type="number"
                value={submitHours}
                onChange={(e) => setSubmitHours(Number(e.target.value))}
                placeholder="Hours"
              />
              <FormInput
                label=""
                name="submit_minutes"
                type="number"
                value={submitMinutes}
                onChange={(e) => setSubmitMinutes(Number(e.target.value))}
                placeholder="Minutes"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Extension Grace Period</label>
            <div className="flex gap-2">
              <FormInput
                label=""
                name="extension_days"
                type="number"
                value={extensionDays}
                onChange={(e) => setExtensionDays(Number(e.target.value))}
                placeholder="Days"
              />
              <FormInput
                label=""
                name="extension_hours"
                type="number"
                value={extensionHours}
                onChange={(e) => setExtensionHours(Number(e.target.value))}
                placeholder="Hours"
              />
              <FormInput
                label=""
                name="extension_minutes"
                type="number"
                value={extensionMinutes}
                onChange={(e) => setExtensionMinutes(Number(e.target.value))}
                placeholder="Minutes"
              />
            </div>
          </div>
        </FormGrid>
      </FormSection>

      {/* Questions/Sections */}
      <FormSection title="Sections & Questions" icon={ClipboardList}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border border-border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Section {sectionIndex + 1}</h4>
              {sections.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(sectionIndex)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <FormInput
              label="Group"
              name={`group_${sectionIndex}`}
              type="select"
              value={section.group}
              onChange={(e) => handleSectionChange(sectionIndex, e.target.value)}
              options={siteOptions}
              placeholder="Select Group"
              className="mb-4"
            />

            {section.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="bg-muted/50 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Question {questionIndex + 1}</span>
                  {section.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(sectionIndex, questionIndex)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <FormGrid columns={2}>
                  <FormInput
                    label="Question"
                    name={`question_${sectionIndex}_${questionIndex}`}
                    value={question.name}
                    onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, "name", e.target.value)}
                    placeholder="Enter Question"
                  />
                  <FormInput
                    label="Type"
                    name={`type_${sectionIndex}_${questionIndex}`}
                    type="select"
                    value={question.type}
                    onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, "type", e.target.value)}
                    options={questionTypeOptions}
                    placeholder="Select Type"
                  />
                </FormGrid>

                {(question.type === "radio" || question.type === "checkbox") && (
                  <div className="mt-3">
                    <label className="text-sm text-muted-foreground mb-2 block">Options</label>
                    <FormGrid columns={4}>
                      {[0, 1, 2, 3].map((optionIndex) => (
                        <FormInput
                          key={optionIndex}
                          label=""
                          name={`option_${sectionIndex}_${questionIndex}_${optionIndex}`}
                          value={question.options[optionIndex]}
                          onChange={(e) =>
                            handleQuestionChange(sectionIndex, questionIndex, "option", e.target.value, optionIndex)
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                      ))}
                    </FormGrid>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mt-3">
                  <FormToggle
                    label="Mandatory"
                    checked={question.question_mandatory}
                    onChange={(v) => handleQuestionChange(sectionIndex, questionIndex, "question_mandatory", v)}
                  />
                  <FormToggle
                    label="Reading"
                    checked={question.reading}
                    onChange={(v) => handleQuestionChange(sectionIndex, questionIndex, "reading", v)}
                  />
                  {weightage && (
                    <>
                      <FormToggle
                        label="Rating"
                        checked={question.rating}
                        onChange={(v) => handleQuestionChange(sectionIndex, questionIndex, "rating", v)}
                      />
                      <FormInput
                        label="Weightage"
                        name={`weightage_${sectionIndex}_${questionIndex}`}
                        type="number"
                        value={question.weightage}
                        onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, "weightage", e.target.value)}
                        placeholder="Weightage"
                        className="w-24"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={() => addQuestion(sectionIndex)}>
              <Plus className="w-4 h-4 mr-2" /> Add Question
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addSection}>
          <Plus className="w-4 h-4 mr-2" /> Add Section
        </Button>
      </FormSection>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Checklist"}
        </Button>
      </div>
    </div>
  );
};

export default ChecklistCreateForm;
