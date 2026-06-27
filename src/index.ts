// Core models
export { EduCourse } from "./courseFormat/EduCourse"
export { CourseraCourse } from "./courseFormat/CourseraCourse"
export { Course } from "./courseFormat/Course"
export { Lesson } from "./courseFormat/Lesson"
export { FrameworkLesson } from "./courseFormat/FrameworkLesson"
export { Section } from "./courseFormat/Section"
export { TaskFile } from "./courseFormat/TaskFile"
export { Task } from "./courseFormat/tasks/Task"
export { EduTask } from "./courseFormat/tasks/EduTask"
export { OutputTask } from "./courseFormat/tasks/OutputTask"
export { TheoryTask } from "./courseFormat/tasks/TheoryTask"
export { IdeTask } from "./courseFormat/tasks/IdeTask"
export { UnsupportedTask } from "./courseFormat/tasks/UnsupportedTask"
export { ChoiceTask } from "./courseFormat/tasks/choice/ChoiceTask"
export { Vendor } from "./courseFormat/Vendor"
export { CheckStatus } from "./courseFormat/CheckStatus"
export { EmtpyFileContentFactory } from "./courseFormat/EmtpyFileContentFactory"

// Yaml module
export { YamlMixinNames, YamlMixinName } from "./yaml/YamlMixinNames"
export {
  COURSE_CONFIG,
  SECTION_CONFIG,
  LESSON_CONFIG,
  TASK_CONFIG,
  REMOTE_COURSE_CONFIG,
  REMOTE_SECTION_CONFIG,
  REMOTE_LESSON_CONFIG,
  REMOTE_TASK_CONFIG,
  getConfigFileName,
  getRemoteConfigFileName,
} from "./yaml/YamlConfigSettings"
export {
  deserializeItem as yamlDeserializeItem,
  deserializeCourse as yamlDeserializeCourse,
  deserializeSection as yamlDeserializeSection,
  deserializeLesson as yamlDeserializeLesson,
  deserializeTask as yamlDeserializeTask,
  deserializeRemoteItem,
  getChildrenConfigFileNames,
} from "./yaml/YamlDeserializer"
export { parseYaml, stringifyYaml, CURRENT_YAML_VERSION } from "./yaml/YamlMapper"
export { TitledStudyItem } from "./yaml/TitledStudyItem"
export { RemoteStudyItem } from "./yaml/RemoteStudyItem"
export { studyItemToName } from "./yaml/StudyItemConverter"
export {
  InvalidYamlFormatException,
  formatError,
  unsupportedItemTypeMessage,
  unnamedItemAtMessage,
  negativeLengthNotAllowedMessage,
  negativeOffsetNotAllowedMessage,
} from "./yaml/errorHandling/InvalidYamlFormatException"

// Loader
export { loadFromYamlZip } from "./loader"
export {
  YamlLoadingException,
  RemoteYamlLoadingException,
  loadingError,
  noDirForItemMessage,
  unknownConfigMessage,
  unexpectedItemTypeMessage,
} from "./yaml/errorHandling/YamlLoadingException"

// VFS abstraction
export type { VirtualFileSystem } from "./yaml/VirtualFileSystem"

// YAML Loader (deserialize + path helpers)
export {
  studyItemExtGetPathToChildren,
  taskExtDirName,
  taskExtFindDir,
  studyItemExtGetDir,
  getConfigFileForChild,
  deserializeContent,
  deserializeChildrenIfNeeded,
} from "./yaml/YamlLoader"

// YAML Deep Loader (main loadCourse entry point + task helpers)
export {
  loadCourse,
  studyItemExtVisitTasks,
  taskExtGetTaskDirectory,
  taskExtToDescriptionFormat,
  taskExtGetDescriptionFile,
  taskExtUpdateDescriptionTextAndFormat,
  loadRemoteInfo,
  loadRemoteInfoRecursively,
  setDescriptionInfo,
} from "./yaml/YamlDeepLoader"
