import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb";
import ListToolbar from "../../components/ui/ListToolbar";
import DataCard from "../../components/ui/DataCard";
import DataTable, { TableColumn } from "../../components/ui/DataTable";
import StatusBadge, { StatusType } from "../../components/ui/StatusBadge";
import { serviceDeskService, Ticket } from "../../services/serviceDesk.service";
import {
  Loader2,
  Ticket as TicketIcon,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const TicketList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{
    building_name?: string;
    floor_name?: string;
    unit_name?: string;
    status?: string;
    priority?: string;
    category?: string;
    assigned_to?: string;
    date_start?: string;
    date_end?: string;
    search?: string; // add this
  }>({});

  const [lookups, setLookups] = useState<{
    buildings: string[];
    floors: string[];
    units: string[];
    categories: string[];
    statuses: string[];
    priorities: string[];
    assignees: string[];
  }>({
    buildings: [],
    floors: [],
    units: [],
    categories: [],
    statuses: [],
    priorities: [],
    assignees: [],
  });

  // Records per page: 12 for grid, 10 for table
  const getPerPage = (mode: "grid" | "table") => (mode === "grid" ? 12 : 10);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: getPerPage("grid"),
    total: 0,
    totalPages: 0,
  });

  // Update perPage when viewMode changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      perPage: getPerPage(viewMode),
      page: 1,
    }));
  }, [viewMode]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceDeskService.getTickets(
        pagination.page,
        pagination.perPage,
        filters
      );
      const data = response.data;
      const ticketList = Array.isArray(data)
        ? data
        : data?.complaints || data?.data || [];
      setTickets(ticketList);
      setPagination((prev) => ({
        ...prev,
        total: data.total || data.total_count || ticketList.length,
        totalPages:
          data.total_pages ||
          Math.ceil((data.total || ticketList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getTicketStatus = (ticket: Ticket): StatusType => {
    const status =
      ticket.status?.toLowerCase() ||
      ticket.complaint_status?.name?.toLowerCase();
    if (status?.includes("open") || status?.includes("new")) return "pending";
    if (status?.includes("progress") || status?.includes("assigned"))
      return "maintenance";
    if (status?.includes("resolved") || status?.includes("closed"))
      return "checked-out";
    return "pending";
  };

  const getPriorityType = (priority?: string): StatusType => {
    if (
      priority?.toLowerCase() === "high" ||
      priority?.toLowerCase() === "critical"
    )
      return "breakdown";
    if (priority?.toLowerCase() === "medium") return "maintenance";
    return "in-store";
  };

  const getStatusCount = (label: string) => dashboard?.by_status?.[label] ?? 0;

  const getTypeCount = (label: string) => dashboard?.by_type?.[label] ?? 0;

  const fetchDashboard = useCallback(async () => {
    try {
      const resp = await serviceDeskService.getDashboard();
      setDashboard(resp.data);
    } catch (e) {
      console.error("Failed to load dashboard", e);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!tickets.length) return;

    const buildings = new Set<string>();
    const floors = new Set<string>();
    const units = new Set<string>();
    const categories = new Set<string>();
    const statuses = new Set<string>();
    const priorities = new Set<string>();
    const assignees = new Set<string>();

    tickets.forEach((t) => {
      if (t.building_name) buildings.add(t.building_name);
      if (t.floor_name) floors.add(t.floor_name);
      if ((t as any).unit_name || (t as any).unit) {
        units.add((t as any).unit_name || (t as any).unit);
      }
      if ((t as any).category_type || t.category) {
        categories.add((t as any).category_type || (t.category as string));
      }
      const st =
        t.status || (t as any).issue_status || t.complaint_status?.name;
      if (st) statuses.add(st);

      if (t.priority) priorities.add(t.priority);
      if (t.assigned_to) assignees.add(t.assigned_to);
    });

    setLookups({
      buildings: Array.from(buildings),
      floors: Array.from(floors),
      units: Array.from(units),
      categories: Array.from(categories),
      statuses: Array.from(statuses),
      priorities: Array.from(priorities),
      assignees: Array.from(assignees),
    });
  }, [tickets]);

  const columns: TableColumn<Ticket>[] = [
    // TICKET NUMBER
    {
      key: "ticket_number",
      header: "Ticket Number",
      render: (v, row) => row.ticket_number || "-",
    },

    // BUILDING NAME
    {
      key: "building_name",
      header: "Building Name",
      render: (v, row) => row.building_name || "-",
    },

    // FLOOR NAME
    {
      key: "floor_name",
      header: "Floor Name",
      render: (v, row) => row.floor_name || "-",
    },

    // UNIT NAME
    {
      key: "unit_name",
      header: "Unit Name",
      render: (v, row) => row.unit_name || row.unit || "-",
    },

    // CUSTOMER NAME (created_by in backend)
    {
      key: "reporter_name",
      header: "Customer Name",
      render: (v, row) => row.reporter_name || (row as any).created_by || "-",
    },

    // CATEGORY
    {
      key: "category",
      header: "Category",
      render: (v, row) =>
        row.helpdesk_category?.name ||
        (row as any).category_type ||
        row.category ||
        "-",
    },

    // SUB CATEGORY
    {
      key: "sub_category",
      header: "Sub Category",
      render: (v, row) => (row as any).sub_category || row.sub_category || "-",
    },

    // TITLE / SUBJECT (heading/text)
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (v, row) =>
        row.title || (row as any).heading || (row as any).text || "-",
    },

    // STATUS (issue_status / complaint_status.name)
    {
      key: "status",
      header: "Status",
      render: (v, row) => {
        const status =
          row.status ||
          (row as any).issue_status ||
          row.complaint_status?.name ||
          "";
        return <StatusBadge status={getTicketStatus({ ...row, status })} />;
      },
    },

    // PRIORITY (P1/P2... + badge)
    {
      key: "priority",
      header: "Priority",
      render: (v, row) =>
        row.priority ? (
          <StatusBadge status={getPriorityType(row.priority)} />
        ) : (
          "-"
        ),
    },

    // ASSIGNED TO
    {
      key: "assigned_to",
      header: "Assigned To",
      render: (v, row) => row.assigned_to || "Unassigned",
    },

    // TICKET TYPE (issue_type: Complaint/Request/Suggestion)
    {
      key: "issue_type",
      header: "Ticket Type",
      render: (v, row) => (row as any).issue_type || "-",
    },

    // TOTAL TIME (e.g. "8 days ago" from created_at)
    {
      key: "total_time",
      header: "Total Time",
      render: (v, row) => {
        if (!row.created_at) return "-";
        const created = new Date(row.created_at);
        const diffMs = Date.now() - created.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return "Today";
        if (diffDays === 1) return "1 day ago";
        return `${diffDays} days ago`;
      },
    },
  ];

  if (loading && tickets.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Tickets</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchTickets}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb
        items={[
          { label: "Service Desk", path: "/service-desk" },
          { label: "Tickets" },
        ]}
      />

      {dashboard && (
        <div className="mb-6 space-y-4">
          {/* Status row */}
          <div className="flex flex-wrap gap-3">
            {[
              "Pending",
              "Closed",
              "Complete",
              "Work Completed",
              "Reopened",
              "Approved",
              "Work In Process",
              "Approval Pending",
              "Plumbing",
            ].map((label) => (
              <div
                key={label}
                className="flex min-w-[140px] flex-col items-center justify-center rounded-full border border-purple-300 bg-purple-50 px-5 py-2 text-xs shadow-sm"
              >
                <span className="font-medium text-gray-700">{label}</span>
                <span className="mt-1 text-base font-semibold text-purple-700">
                  {getStatusCount(label)}
                </span>
              </div>
            ))}
          </div>

          {/* Type row */}
          <div className="flex flex-wrap gap-3">
            {["Suggestion", "Req", "Complaint", "Request"].map((label) => (
              <div
                key={label}
                className="flex min-w-[140px] flex-col items-center justify-center rounded-full border border-purple-300 bg-purple-50 px-5 py-2 text-xs shadow-sm"
              >
                <span className="font-medium text-gray-700">{label}</span>
                <span className="mt-1 text-base font-semibold text-purple-700">
                  {getTypeCount(label)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ListToolbar
        searchPlaceholder="Search tickets..."
        searchValue={searchValue}
        onSearchChange={(val) => {
          setSearchValue(val);
          setFilters((prev) => ({ ...prev, search: val || undefined }));
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilter={() => setIsFilterOpen(true)}
        onExport={() => {}}
        onAdd={() => navigate("/service-desk/create")}
        addLabel="Create Ticket"
      />

      {isFilterOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-4xl rounded-xl bg-card shadow-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">Filter By</h2>
              <button
                className="text-xl leading-none"
                onClick={() => setIsFilterOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Building Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Building Name
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.building_name || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        building_name: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Building</option>
                    {lookups.buildings.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Floor Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Floor Name
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.floor_name || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        floor_name: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Floor</option>
                    {lookups.floors.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Unit Name
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.unit_name || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        unit_name: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Unit</option>
                    {lookups.units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Start */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date Start
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.date_start || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        date_start: e.target.value || undefined,
                      }))
                    }
                  />
                </div>

                {/* Date End */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date End
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.date_end || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        date_end: e.target.value || undefined,
                      }))
                    }
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.category || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Category</option>
                    {lookups.categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.status || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Status</option>
                    {lookups.statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Level */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority Level
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.priority || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priority: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Priority Level</option>
                    {lookups.priorities.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Assigned To
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.assigned_to || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        assigned_to: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">Select Assign To</option>
                    {lookups.assignees.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
              <button
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={() => {
                  setFilters({});
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  setIsFilterOpen(false);
                }}
              >
                Reset
              </button>
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                onClick={() => {
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  setIsFilterOpen(false); // fetchTickets will run automatically because filters state is already set
                }}
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
          <TicketIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tickets Found</h3>
          <p className="text-muted-foreground mb-4">
            No support tickets have been created yet
          </p>
          <Link
            to="/service-desk/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            + Create Ticket
          </Link>
        </div>
      )}

      {viewMode === "grid" && tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tickets.map((ticket) => (
            <DataCard
              key={ticket.id}
              title={ticket.title || `Ticket #${ticket.ticket_number}`}
              subtitle={ticket.ticket_number || "-"}
              status={getTicketStatus(ticket)}
              fields={[
                {
                  label: "Category",
                  value:
                    ticket.helpdesk_category?.name || ticket.category || "-",
                },
                { label: "Priority", value: ticket.priority || "-" },
                {
                  label: "Assigned",
                  value: ticket.assigned_to || "Unassigned",
                },
                {
                  label: "Created",
                  value: ticket.created_at
                    ? new Date(ticket.created_at).toLocaleDateString()
                    : "-",
                },
              ]}
              viewPath={`/service-desk/${ticket.id}`}
              editPath={`/service-desk/${ticket.id}/edit`}
            />
          ))}
        </div>
      ) : (
        tickets.length > 0 && (
          <DataTable
            columns={columns}
            data={tickets}
            selectable
            selectedRows={selectedRows}
            onSelectRow={(id) =>
              setSelectedRows((prev) =>
                prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
              )
            }
            onSelectAll={() =>
              setSelectedRows(
                selectedRows.length === tickets.length
                  ? []
                  : tickets.map((t) => String(t.id))
              )
            }
            viewPath={(row) => `/service-desk/${row.id}`}
          />
        )
      )}

      {tickets.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.perPage + 1} to{" "}
            {Math.min(pagination.page * pagination.perPage, pagination.total)}{" "}
            of {pagination.total} records
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              «
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              ‹ Prev
            </button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
              {pagination.page}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Next ›
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.totalPages }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              »
            </button>
          </div>
          <select
            value={pagination.perPage}
            onChange={(e) =>
              setPagination((prev) => ({
                ...prev,
                perPage: Number(e.target.value),
                page: 1,
              }))
            }
            className="px-2 py-1.5 text-sm border border-border rounded-md bg-background"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default TicketList;
