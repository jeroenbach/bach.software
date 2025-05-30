/**
 * Helper to create a defaultStory function with intellisense.
 * This way typescript helps us with the parameters & args, which can contain an object tree.
 *
 * Please use as followed: createDefaultStory((_: Story) => ({ decoraters: ... your actual story config })
 * Where the type Story is your StoryObj with metadata. In the end we don't use the parameter, only for type inference.
 */
export const createDefaultStory =
  <StoryMeta, T extends StoryMeta>(
    storyfn: (parameterOnlyUsedToDetermineStoryType: StoryMeta) => T,
  ) =>
  (changeDefaultfn: (story: T) => void = () => {}) => {
    const story = storyfn(null as StoryMeta);
    changeDefaultfn(story);
    return story;
  };
