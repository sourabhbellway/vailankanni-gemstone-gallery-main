import { useEffect, useRef, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";

// removed alert dialog since delete is not allowed
type Scheme = {
    id?: number;
    name: string;
    timeline: string;
    minAmount: number;
    isPopular: boolean;
    status: "Active" | "Inactive";
    points: string[]; // editable bullet points/benefits
};

type SchemeModalProps = {
    initialData: Scheme;
    onSubmit: (data: Scheme) => void;
};
import { useToast } from "@/hooks/use-toast";

const EditSchemeDialog: React.FC<SchemeModalProps> = ({ initialData, onSubmit }) => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<Scheme>(initialData);

    const updatePoint = (idx: number, value: string) => {
        const next = [...form.points];
        next[idx] = value;
        setForm({ ...form, points: next });
    };

    const addPoint = () => setForm({ ...form, points: [...form.points, ""] });
    const removePoint = (idx: number) => setForm({ ...form, points: form.points.filter((_, i) => i !== idx) });

    const handleSubmit = () => {
        onSubmit(form);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Plan</DialogTitle>
                    <DialogDescription>Update plan fields and points</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Name</Label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <Label>Timeline</Label>
                        <Input value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
                    </div>
                    <div>
                        <Label>Min Amount</Label>
                        <Input type="number" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })} />
                    </div>
                    <div>
                        <Label>Status</Label>
                        <Select value={form.status} onValueChange={(v: "Active" | "Inactive") => setForm({ ...form, status: v })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="mt-4">
                    <Label>Is Popular</Label>
                    <div className="mt-2">
                        <Select value={String(form.isPopular)} onValueChange={(v) => setForm({ ...form, isPopular: v === "true" })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="mt-6">
                    <Label>Points</Label>
                    <div className="space-y-2 mt-2">
                        {form.points.map((p, idx) => (
                            <div key={idx} className="flex gap-2">
                                <Input value={p} onChange={(e) => updatePoint(idx, e.target.value)} />
                                <Button variant="outline" onClick={() => removePoint(idx)}>Remove</Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addPoint}>Add Point</Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const SchemeManagement: React.FC = () => {
    // Example schemes data matching your new table headers
    const schemes: Scheme[] = [
        {
            id: 1,
            name: "Quick Saver",
            timeline: "3 Months",
            minAmount: 2000,
            isPopular: false,
            status: "Active",
            points: ["Quick accumulation", "Low commitment", "Instant liquidity"],
        },
        {
            id: 2,
            name: "Smart Saver",
            timeline: "6 Months",
            minAmount: 3000,
            isPopular: true,
            status: "Active",
            points: ["Balanced approach", "Better gold accumulation", "Flexible payments"],
        },
        {
            id: 3,
            name: "Gold Builder",
            timeline: "12 Months",
            minAmount: 5000,
            isPopular: false,
            status: "Active",
            points: ["Maximum savings", "Best gold rates", "Premium jewelry access"],
        },
    ];

    return (
        <div className="p-6">
            {/* Heading and add scheme button */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Manage Plans</h1>
                    <p className="text-muted-foreground">
                        Buying gold made simple
                    </p>
                </div>

            </div>

            {/* Products Table */}
            <Card>

                <CardHeader>
                    <CardTitle>Plans</CardTitle>
                    <CardDescription>Manage your subsciption plans</CardDescription>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Scheme ID</TableHead>
                                <TableHead>Scheme</TableHead>
                                <TableHead>Timeline</TableHead>
                                <TableHead>Min Amount</TableHead>
                                <TableHead>Is Popular</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Edit</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {schemes.map((scheme) => (
                                <TableRow key={scheme.id}>
                                    <TableCell className="font-medium">{scheme.id}</TableCell>
                                    <TableCell>{scheme.name}</TableCell>
                                    <TableCell>{scheme.timeline}</TableCell>
                                    <TableCell>{scheme.minAmount}</TableCell>
                                    <TableCell>
                                        <Badge variant={scheme.isPopular ? "default" : "secondary"}>
                                            {scheme.isPopular ? "Yes" : "No"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={scheme.status === "Active" ? "default" : "destructive"}>
                                            {scheme.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <EditSchemeDialog
                                            initialData={scheme}
                                            onSubmit={(updated) => {
                                                // For now just toast; integrate API when available
                                                // eslint-disable-next-line no-console
                                                console.log("updated scheme", updated);
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default SchemeManagement;
