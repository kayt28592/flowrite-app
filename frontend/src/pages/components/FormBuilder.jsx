import React, { useState } from 'react';
import { Plus, X, GripVertical, Settings2, Eye, Save, Type, Hash, Calendar, List, CheckSquare, PenTool, Image as ImageIcon, Heading } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { motion, Reorder } from 'framer-motion';
import toast from 'react-hot-toast';

const FIELD_TYPES = [
    { type: 'heading', label: 'Section Heading', icon: Heading },
    { type: 'text', label: 'Short Text', icon: Type },
    { type: 'textarea', label: 'Long Text', icon: Type },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'date', label: 'Date Pick', icon: Calendar },
    { type: 'select', label: 'Dropdown', icon: List },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'signature', label: 'Signature Pad', icon: PenTool },
    { type: 'image', label: 'Image Upload', icon: ImageIcon },
];

export default function FormBuilder({ initialTemplate, onSave }) {
    const [title, setTitle] = useState(initialTemplate?.title || '');
    const [description, setDescription] = useState(initialTemplate?.description || '');
    const [fields, setFields] = useState(initialTemplate?.fields || []);
    const [previewMode, setPreviewMode] = useState(false);

    const addField = (type) => {
        const newField = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
            required: false,
            placeholder: '',
            options: type === 'select' ? ['Option 1', 'Option 2'] : [],
            order: fields.length
        };
        setFields([...fields, newField]);
    };

    const removeField = (id) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id, updates) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleSave = () => {
        if (!title) {
            toast.error('Please enter a form title');
            return;
        }
        if (fields.length === 0) {
            toast.error('Please add at least one field');
            return;
        }
        onSave({ title, description, fields });
    };

    if (previewMode) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Preview: {title}</h2>
                    <Button variant="outline" onClick={() => setPreviewMode(false)}>Exit Preview</Button>
                </div>
                <Card className="bg-navy-900/50 border-white/5 p-8 max-w-2xl mx-auto">
                    <div className="space-y-8">
                        {fields.map(field => (
                            <div key={field.id} className="space-y-2">
                                {field.type === 'heading' ? (
                                    <h3 className="text-xl font-bold border-b border-white/5 pb-2 text-flow-blue">{field.label}</h3>
                                ) : (
                                    <>
                                        <label className="text-sm font-medium text-slate-400">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="p-3 bg-navy-950 border border-white/10 rounded-lg text-slate-500 italic">
                                            {field.placeholder || `Input for ${field.type}...`}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Settings */}
            <Card className="bg-navy-900/50 border-white/5">
                <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-slate-500">Form Title</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Equipment Inspection Form"
                                className="bg-navy-950 border-white/10 text-xl font-bold"
                            />
                        </div>
                        <div className="flex-auto space-y-2">
                            <div className="flex gap-2 h-full items-end pb-1">
                                <Button variant="outline" onClick={() => setPreviewMode(true)} className="gap-2">
                                    <Eye size={18} /> Preview
                                </Button>
                                <Button onClick={handleSave} className="gap-2 bg-flow-blue hover:bg-blue-600">
                                    <Save size={18} /> Save Template
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-slate-500">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the purpose of this form..."
                            className="w-full bg-navy-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-flow-blue h-20"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Element Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">Elements</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {FIELD_TYPES.map(f => (
                            <button
                                key={f.type}
                                onClick={() => addField(f.type)}
                                className="flex items-center gap-3 p-3 bg-navy-900/50 border border-white/5 rounded-xl text-slate-300 hover:bg-flow-blue/10 hover:border-flow-blue/30 hover:text-white transition-all group text-left"
                            >
                                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-flow-blue/20">
                                    <f.icon size={18} />
                                </div>
                                <span className="text-sm font-medium">{f.label}</span>
                                <Plus size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Drop Zone */}
                <div className="lg:col-span-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">Form Structure</h3>
                    {fields.length === 0 ? (
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-20 flex flex-col items-center justify-center text-slate-600 bg-navy-900/20">
                            <Plus size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium">Click an element on the left to start building</p>
                        </div>
                    ) : (
                        <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4">
                            {fields.map((field) => (
                                <Reorder.Item
                                    key={field.id}
                                    value={field}
                                    className="group bg-navy-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors cursor-default"
                                >
                                    <div className="flex gap-4">
                                        <div className="cursor-grab active:cursor-grabbing text-slate-700 hover:text-slate-400 py-1">
                                            <GripVertical size={20} />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <input
                                                        value={field.label}
                                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                        className="w-full bg-transparent border-none text-lg font-bold text-white focus:ring-0 p-0 mb-1"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 text-slate-500 px-2 py-0.5 rounded">
                                                            {field.type}
                                                        </span>
                                                        <label className="flex items-center gap-2 cursor-pointer ml-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                                className="rounded border-white/10 bg-navy-950 text-flow-blue focus:ring-flow-blue"
                                                            />
                                                            <span className="text-xs text-slate-500">Required</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeField(field.id)}
                                                    className="text-slate-600 hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    <X size={18} />
                                                </Button>
                                            </div>

                                            {/* Field Specific Config */}
                                            {field.type !== 'heading' && field.type !== 'signature' && field.type !== 'image' && (
                                                <div className="pt-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-1">Placeholder</label>
                                                    <Input
                                                        value={field.placeholder}
                                                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                        placeholder="Enter placeholder text..."
                                                        className="bg-navy-950 h-8 text-xs border-white/5"
                                                    />
                                                </div>
                                            )}

                                            {field.type === 'select' && (
                                                <div className="pt-2 space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block">Options (comma separated)</label>
                                                    <Input
                                                        value={field.options.join(', ')}
                                                        onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(o => o.trim()) })}
                                                        placeholder="Option 1, Option 2, ..."
                                                        className="bg-navy-950 h-8 text-xs border-white/5"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    )}
                </div>
            </div>
        </div>
    );
}
