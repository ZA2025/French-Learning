"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Play,
  Trash2,
  Languages,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

export default function App() {
  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState("");
  const [activeLessonId, setActiveLessonId] = useState("");
  const [newInput, setNewInput] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: "entry",
    id: "",
  });
  const [editingModule, setEditingModule] = useState("");
  const [editingModuleName, setEditingModuleName] = useState("");
  const [editingLesson, setEditingLesson] = useState("");
  const [editingLessonName, setEditingLessonName] = useState("");

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("frenchLearningData");
    if (stored) {
      const data = JSON.parse(stored);
      if (data.modules) {
        setModules(data.modules);
        if (data.modules.length > 0) {
          setActiveModuleId(data.modules[0].id);
          if (data.modules[0].lessons.length > 0) {
            setActiveLessonId(data.modules[0].lessons[0].id);
          }
        }
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (modules.length > 0) {
      localStorage.setItem(
        "frenchLearningData",
        JSON.stringify({ modules }),
      );
    }
  }, [modules]);

  const addModule = () => {
    const newModule = {
      id: Date.now().toString(),
      name: `Module ${modules.length + 1}`,
      lessons: [],
    };
    setModules([...modules, newModule]);
    setActiveModuleId(newModule.id);
    toast.success("Module added");
  };

  const renameModule = (moduleId, newName) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId ? { ...m, name: newName } : m,
      ),
    );
    setEditingModule("");
    toast.success("Module renamed");
  };

  const deleteModule = (moduleId) => {
    const newModules = modules.filter((m) => m.id !== moduleId);
    setModules(newModules);
    if (activeModuleId === moduleId && newModules.length > 0) {
      setActiveModuleId(newModules[0].id);
      if (newModules[0].lessons.length > 0) {
        setActiveLessonId(newModules[0].lessons[0].id);
      } else {
        setActiveLessonId("");
      }
    }
    toast.success("Module deleted");
  };

  const addLesson = (moduleId) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          const newLesson = {
            id: Date.now().toString(),
            name: `Week ${m.lessons.length + 1}`,
            entries: [],
          };
          setActiveLessonId(newLesson.id);
          return { ...m, lessons: [...m.lessons, newLesson] };
        }
        return m;
      }),
    );
    toast.success("Lesson added");
  };

  const renameLesson = (moduleId, lessonId, newName) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId ? { ...l, name: newName } : l,
            ),
          };
        }
        return m;
      }),
    );
    setEditingLesson("");
    toast.success("Lesson renamed");
  };

  const deleteLesson = (moduleId, lessonId) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          const newLessons = m.lessons.filter(
            (l) => l.id !== lessonId,
          );
          if (
            activeLessonId === lessonId &&
            newLessons.length > 0
          ) {
            setActiveLessonId(newLessons[0].id);
          } else if (activeLessonId === lessonId) {
            setActiveLessonId("");
          }
          return { ...m, lessons: newLessons };
        }
        return m;
      }),
    );
    toast.success("Lesson deleted");
  };

  const translateText = async (text) => {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      return data.translation;

    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
    // try {
    //   const response = await fetch(
    //     `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    //       text,
    //     )}&langpair=fr|en`,
    //   );
    //   const data = await response.json();
    //   return data.responseData?.translatedText || text;
    // } catch (error) {
    //   console.error("Translation error:", error);
    //   return text;
    // }
  };

  const addEntry = async () => {
    if (!newInput.trim() || !activeLessonId) return;

    const translation = await translateText(newInput.trim());

    setModules(
      modules.map((m) => {
        if (m.id === activeModuleId) {
          return {
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id === activeLessonId) {
                const newEntry = {
                  id: Date.now().toString(),
                  french: newInput.trim(),
                  english: translation,
                  showTranslation: false,
                };
                return {
                  ...l,
                  entries: [...l.entries, newEntry],
                };
              }
              return l;
            }),
          };
        }
        return m;
      }),
    );
    setNewInput("");
    toast.success("Entry added");
  };

  const updateEntry = async (entryId, newFrench) => {
    const translation = await translateText(newFrench);

    setModules(
      modules.map((m) => {
        if (m.id === activeModuleId) {
          return {
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id === activeLessonId) {
                return {
                  ...l,
                  entries: l.entries.map((e) =>
                    e.id === entryId
                      ? {
                          ...e,
                          french: newFrench,
                          english: translation,
                        }
                      : e,
                  ),
                };
              }
              return l;
            }),
          };
        }
        return m;
      }),
    );
  };

  const toggleTranslation = (entryId) => {
    setModules(
      modules.map((m) => {
        if (m.id === activeModuleId) {
          return {
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id === activeLessonId) {
                return {
                  ...l,
                  entries: l.entries.map((e) =>
                    e.id === entryId
                      ? {
                          ...e,
                          showTranslation: !e.showTranslation,
                        }
                      : e,
                  ),
                };
              }
              return l;
            }),
          };
        }
        return m;
      }),
    );
  };

  const deleteEntry = (entryId) => {
    setModules(
      modules.map((m) => {
        if (m.id === activeModuleId) {
          return {
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id === activeLessonId) {
                return {
                  ...l,
                  entries: l.entries.filter(
                    (e) => e.id !== entryId,
                  ),
                };
              }
              return l;
            }),
          };
        }
        return m;
      }),
    );
    toast.success("Entry deleted");
  };

  const playAudio = (text) => {
    if (typeof window === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const activeModule = modules.find(
    (m) => m.id === activeModuleId,
  );
  const activeLesson = activeModule?.lessons.find(
    (l) => l.id === activeLessonId,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-black mb-2">
            French Audio Trainer - Learn French with audio!
          </h1>
          <p className="text-slate-600">
            Create modules, lessons, and practice French vocabulary with audio!
          </p>
        </div>

        <Card className="p-6 bg-white shadow-lg">
          {/* Modules Tabs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-black">Modules</h2>
              <Button
                onClick={addModule}
                size="sm"
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Module
              </Button>
            </div>

            {modules.length > 0 ? (
              <Tabs
                value={activeModuleId}
                onValueChange={setActiveModuleId}
              >
                <TabsList className="w-full flex-wrap h-auto">
                  {modules.map((module) => (
                    <TabsTrigger
                      key={module.id}
                      value={module.id}
                      className="relative group"
                    >
                      {editingModule === module.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingModuleName}
                            onChange={(e) =>
                              setEditingModuleName(
                                e.target.value,
                              )
                            }
                            className="h-6 w-32"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                renameModule(
                                  module.id,
                                  editingModuleName,
                                );
                              if (e.key === "Escape")
                                setEditingModule("");
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            asChild
                          >
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                renameModule(
                                  module.id,
                                  editingModuleName,
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  renameModule(
                                    module.id,
                                    editingModuleName,
                                  );
                                }
                              }}
                            >
                            <Check className="w-3 h-3" />
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            asChild
                          >
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingModule("");
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingModule("");
                                }
                              }}
                            >
                            <X className="w-3 h-3" />
                            </span>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{module.name}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              asChild
                            >
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingModule(module.id);
                                  setEditingModuleName(
                                    module.name,
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setEditingModule(module.id);
                                    setEditingModuleName(
                                      module.name,
                                    );
                                  }
                                }}
                              >
                              <Edit2 className="w-3 h-3" />
                              </span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              asChild
                            >
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialog({
                                    open: true,
                                    type: "module",
                                    id: module.id,
                                  });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDeleteDialog({
                                      open: true,
                                      type: "module",
                                      id: module.id,
                                    });
                                  }
                                }}
                              >
                              <Trash2 className="w-3 h-3" />
                              </span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {modules.map((module) => (
                  <TabsContent
                    key={module.id}
                    value={module.id}
                    className="mt-6"
                  >
                    {/* Lessons Section */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-black">
                          Lessons
                        </h3>
                        <Button
                          onClick={() => addLesson(module.id)}
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-black hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Lesson
                        </Button>
                      </div>

                      {module.lessons.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                          {module.lessons.map((lesson) => (
                            <Card
                              key={lesson.id}
                              className={`p-4 cursor-pointer transition-all ${
                                activeLessonId === lesson.id
                                  ? "border-black border-2 bg-gray-50"
                                  : "hover:border-gray-300"
                              }`}
                              onClick={() =>
                                setActiveLessonId(lesson.id)
                              }
                            >
                              {editingLesson === lesson.id ? (
                                <div
                                  className="flex items-center gap-1"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <Input
                                    value={editingLessonName}
                                    onChange={(e) =>
                                      setEditingLessonName(
                                        e.target.value,
                                      )
                                    }
                                    className="h-8"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        renameLesson(
                                          module.id,
                                          lesson.id,
                                          editingLessonName,
                                        );
                                      if (e.key === "Escape")
                                        setEditingLesson("");
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      renameLesson(
                                        module.id,
                                        lesson.id,
                                        editingLessonName,
                                      )
                                    }
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      setEditingLesson("")
                                    }
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-800">
                                      {lesson.name}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingLesson(
                                            lesson.id,
                                          );
                                          setEditingLessonName(
                                            lesson.name,
                                          );
                                        }}
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteDialog({
                                            open: true,
                                            type: "lesson",
                                            id: lesson.id,
                                            moduleId: module.id,
                                          });
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-slate-500">
                                    {lesson.entries.length}{" "}
                                    entries
                                  </p>
                                </>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 mb-6">
                          No lessons yet. Add your first lesson!
                        </p>
                      )}
                    </div>

                    {/* Active Lesson Content */}
                    {activeLesson && activeLesson.id && (
                      <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-black">
                            {activeLesson.name}
                          </h3>
                        </div>

                        {/* Add Entry Form */}
                        <div className="flex gap-2 mb-6">
                          <Input
                            value={newInput}
                            onChange={(e) =>
                              setNewInput(e.target.value)
                            }
                            placeholder="Enter French word or sentence..."
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addEntry();
                            }}
                          />
                          <Button
                            onClick={addEntry}
                            className="bg-black hover:bg-gray-800 text-white"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>

                        {/* Entries List */}
                        <div className="space-y-3">
                          {activeLesson.entries.map((entry) => (
                            <Card
                              key={entry.id}
                              className="p-4 bg-white border-slate-200"
                            >
                              <div className="flex items-start gap-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="shrink-0 border-green-300 text-green-700 hover:bg-green-50"
                                  onClick={() =>
                                    playAudio(entry.french)
                                  }
                                >
                                  <Play className="w-4 h-4" />
                                </Button>

                                <div className="flex-1">
                                  <Input
                                    value={entry.french}
                                    onChange={(e) =>
                                      updateEntry(
                                        entry.id,
                                        e.target.value,
                                      )
                                    }
                                    className="mb-2"
                                  />

                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      onClick={() =>
                                        toggleTranslation(
                                          entry.id,
                                        )
                                      }
                                    >
                                      <Languages className="w-4 h-4 mr-1" />
                                      {entry.showTranslation
                                        ? "Hide"
                                        : "Show"}{" "}
                                      English
                                    </Button>
                                  </div>

                                  {entry.showTranslation && (
                                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                      <p className="text-slate-700">
                                        {entry.english}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setDeleteDialog({
                                      open: true,
                                      type: "entry",
                                      id: entry.id,
                                      moduleId: module.id,
                                      lessonId: activeLesson.id,
                                    });
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>

                        {activeLesson.entries.length === 0 && (
                          <p className="text-slate-500 text-center py-8">
                            No entries yet. Add your first
                            French word or sentence!
                          </p>
                        )}
                      </Card>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <p className="text-slate-500">
                No modules yet. Add your first module to get
                started!
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ ...deleteDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === "module" &&
                "This will delete the module and all its lessons and entries. This action cannot be undone."}
              {deleteDialog.type === "lesson" &&
                "This will delete the lesson and all its entries. This action cannot be undone."}
              {deleteDialog.type === "entry" &&
                "This will delete this entry. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deleteDialog.type === "module") {
                  deleteModule(deleteDialog.id);
                } else if (
                  deleteDialog.type === "lesson" &&
                  deleteDialog.moduleId
                ) {
                  deleteLesson(
                    deleteDialog.moduleId,
                    deleteDialog.id,
                  );
                } else if (deleteDialog.type === "entry") {
                  deleteEntry(deleteDialog.id);
                }
                setDeleteDialog({
                  ...deleteDialog,
                  open: false,
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
