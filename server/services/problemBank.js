/**
 * Curated Bank of standard LeetCode problems with tags and difficulties.
 * Used for deterministic recommendation scoring without redundant external API requests.
 */
const PROBLEM_BANK = [
  // Array & Two Pointers & Hashing
  { title: "Two Sum", slug: "two-sum", difficulty: "EASY", tags: ["Array", "Hash Table"] },
  { title: "Valid Anagram", slug: "valid-anagram", difficulty: "EASY", tags: ["Hash Table", "String"] },
  { title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "EASY", tags: ["Array", "Hash Table"] },
  { title: "Group Anagrams", slug: "group-anagrams", difficulty: "MEDIUM", tags: ["Hash Table", "String"] },
  { title: "Top K Frequent Elements", slug: "top-k-frequent-elements", difficulty: "MEDIUM", tags: ["Array", "Hash Table"] },
  { title: "Product of Array Except Self", slug: "product-of-array-except-self", difficulty: "MEDIUM", tags: ["Array", "Prefix Sum"] },
  { title: "Valid Sudoku", slug: "valid-sudoku", difficulty: "MEDIUM", tags: ["Array", "Hash Table", "Matrix"] },
  { title: "Encode and Decode Strings", slug: "encode-and-decode-strings", difficulty: "MEDIUM", tags: ["Array", "String"] },
  { title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence", difficulty: "MEDIUM", tags: ["Array", "Hash Table"] },
  
  // Two Pointers
  { title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "EASY", tags: ["Two Pointers", "String"] },
  { title: "Two Sum II - Input Array Is Sorted", slug: "two-sum-ii-input-array-is-sorted", difficulty: "MEDIUM", tags: ["Array", "Two Pointers"] },
  { title: "3Sum", slug: "3sum", difficulty: "MEDIUM", tags: ["Array", "Two Pointers"] },
  { title: "Container With Most Water", slug: "container-with-most-water", difficulty: "MEDIUM", tags: ["Array", "Two Pointers"] },
  { title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "HARD", tags: ["Array", "Two Pointers", "Stack"] },

  // Sliding Window
  { title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "EASY", tags: ["Array", "Sliding Window"] },
  { title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "MEDIUM", tags: ["Hash Table", "String", "Sliding Window"] },
  { title: "Longest Repeating Character Replacement", slug: "longest-repeating-character-replacement", difficulty: "MEDIUM", tags: ["Hash Table", "String", "Sliding Window"] },
  { title: "Permutation in String", slug: "permutation-in-string", difficulty: "MEDIUM", tags: ["Hash Table", "Two Pointers", "String", "Sliding Window"] },
  { title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: "HARD", tags: ["Hash Table", "String", "Sliding Window"] },

  // Stack
  { title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "EASY", tags: ["String", "Stack"] },
  { title: "Min Stack", slug: "min-stack", difficulty: "MEDIUM", tags: ["Stack"] },
  { title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", difficulty: "MEDIUM", tags: ["Array", "Math", "Stack"] },
  { title: "Generate Parentheses", slug: "generate-parentheses", difficulty: "MEDIUM", tags: ["String", "Backtracking", "Stack"] },
  { title: "Daily Temperatures", slug: "daily-temperatures", difficulty: "MEDIUM", tags: ["Array", "Stack", "Monotonic Stack"] },
  { title: "Car Fleet", slug: "car-fleet", difficulty: "MEDIUM", tags: ["Array", "Stack", "Sorting"] },
  { title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: "HARD", tags: ["Array", "Stack", "Monotonic Stack"] },

  // Binary Search
  { title: "Binary Search", slug: "binary-search", difficulty: "EASY", tags: ["Array", "Binary Search"] },
  { title: "Search a 2D Matrix", slug: "search-a-2d-matrix", difficulty: "MEDIUM", tags: ["Array", "Binary Search", "Matrix"] },
  { title: "Koko Eating Bananas", slug: "koko-eating-bananas", difficulty: "MEDIUM", tags: ["Array", "Binary Search"] },
  { title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", difficulty: "MEDIUM", tags: ["Array", "Binary Search"] },
  { title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "MEDIUM", tags: ["Array", "Binary Search"] },
  { title: "Time Based Key-Value Store", slug: "time-based-key-value-store", difficulty: "MEDIUM", tags: ["Hash Table", "Binary Search"] },
  { title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", difficulty: "HARD", tags: ["Array", "Binary Search", "Divide and Conquer"] },

  // Linked List
  { title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "EASY", tags: ["Linked List", "Recursion"] },
  { title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "EASY", tags: ["Linked List", "Recursion"] },
  { title: "Reorder List", slug: "reorder-list", difficulty: "MEDIUM", tags: ["Linked List", "Two Pointers"] },
  { title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", difficulty: "MEDIUM", tags: ["Linked List", "Two Pointers"] },
  { title: "Copy List with Random Pointer", slug: "copy-list-with-random-pointer", difficulty: "MEDIUM", tags: ["Hash Table", "Linked List"] },
  { title: "Add Two Numbers", slug: "add-two-numbers", difficulty: "MEDIUM", tags: ["Linked List", "Math"] },
  { title: "Linked List Cycle", slug: "linked-list-cycle", difficulty: "EASY", tags: ["Hash Table", "Linked List", "Two Pointers"] },
  { title: "Find the Duplicate Number", slug: "find-the-duplicate-number", difficulty: "MEDIUM", tags: ["Array", "Two Pointers", "Binary Search"] },
  { title: "LRU Cache", slug: "lru-cache", difficulty: "MEDIUM", tags: ["Hash Table", "Linked List", "Design"] },
  { title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists", difficulty: "HARD", tags: ["Linked List", "Divide and Conquer", "Heap"] },

  // Trees
  { title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "EASY", tags: ["Tree", "Depth-First Search", "Breadth-First Search"] },
  { title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "EASY", tags: ["Tree", "Depth-First Search", "Breadth-First Search"] },
  { title: "Diameter of Binary Tree", slug: "diameter-of-binary-tree", difficulty: "EASY", tags: ["Tree", "Depth-First Search"] },
  { title: "Balanced Binary Tree", slug: "balanced-binary-tree", difficulty: "EASY", tags: ["Tree", "Depth-First Search"] },
  { title: "Same Tree", slug: "same-tree", difficulty: "EASY", tags: ["Tree", "Depth-First Search"] },
  { title: "Subtree of Another Tree", slug: "subtree-of-another-tree", difficulty: "EASY", tags: ["Tree", "Depth-First Search"] },
  { title: "Lowest Common Ancestor of a Binary Search Tree", slug: "lowest-common-ancestor-of-a-binary-search-tree", difficulty: "MEDIUM", tags: ["Tree", "Depth-First Search"] },
  { title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "MEDIUM", tags: ["Tree", "Breadth-First Search"] },
  { title: "Binary Tree Right Side View", slug: "binary-tree-right-side-view", difficulty: "MEDIUM", tags: ["Tree", "Depth-First Search", "Breadth-First Search"] },
  { title: "Count Good Nodes in Binary Tree", slug: "count-good-nodes-in-binary-tree", difficulty: "MEDIUM", tags: ["Tree", "Depth-First Search", "Breadth-First Search"] },
  { title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", difficulty: "MEDIUM", tags: ["Tree", "Depth-First Search", "Binary Search Tree"] },
  { title: "Kth Smallest Element in a BST", slug: "kth-smallest-element-in-a-bst", difficulty: "MEDIUM", tags: ["Tree", "Depth-First Search", "Binary Search Tree"] },
  { title: "Construct Binary Tree from Preorder and Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal", difficulty: "MEDIUM", tags: ["Array", "Hash Table", "Tree"] },
  { title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum", difficulty: "HARD", tags: ["Tree", "Depth-First Search", "Dynamic Programming"] },
  { title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", difficulty: "HARD", tags: ["String", "Tree", "Depth-First Search", "Breadth-First Search"] },

  // Heap / Priority Queue
  { title: "Kth Largest Element in a Stream", slug: "kth-largest-element-in-a-stream", difficulty: "EASY", tags: ["Tree", "Design", "Heap"] },
  { title: "Last Stone Weight", slug: "last-stone-weight", difficulty: "EASY", tags: ["Array", "Heap"] },
  { title: "K Closest Points to Origin", slug: "k-closest-points-to-origin", difficulty: "MEDIUM", tags: ["Array", "Math", "Divide and Conquer", "Heap"] },
  { title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", difficulty: "MEDIUM", tags: ["Array", "Divide and Conquer", "Sorting", "Heap"] },
  { title: "Task Scheduler", slug: "task-scheduler", difficulty: "MEDIUM", tags: ["Array", "Hash Table", "Greedy", "Heap"] },
  { title: "Find Median from Data Stream", slug: "find-median-from-data-stream", difficulty: "HARD", tags: ["Two Pointers", "Design", "Heap"] },

  // Backtracking
  { title: "Subsets", slug: "subsets", difficulty: "MEDIUM", tags: ["Array", "Backtracking"] },
  { title: "Combination Sum", slug: "combination-sum", difficulty: "MEDIUM", tags: ["Array", "Backtracking"] },
  { title: "Permutations", slug: "permutations", difficulty: "MEDIUM", tags: ["Array", "Backtracking"] },
  { title: "Subsets II", slug: "subsets-ii", difficulty: "MEDIUM", tags: ["Array", "Backtracking", "Bit Manipulation"] },
  { title: "Combination Sum II", slug: "combination-sum-ii", difficulty: "MEDIUM", tags: ["Array", "Backtracking"] },
  { title: "Word Search", slug: "word-search", difficulty: "MEDIUM", tags: ["Array", "Backtracking", "Matrix"] },
  { title: "Palindrome Partitioning", slug: "palindrome-partitioning", difficulty: "MEDIUM", tags: ["String", "Dynamic Programming", "Backtracking"] },
  { title: "Letter Combinations of a Phone Number", slug: "letter-combinations-of-a-phone-number", difficulty: "MEDIUM", tags: ["Hash Table", "String", "Backtracking"] },
  { title: "N-Queens", slug: "n-queens", difficulty: "HARD", tags: ["Array", "Backtracking"] },

  // Graphs & DP
  { title: "Number of Islands", slug: "number-of-islands", difficulty: "MEDIUM", tags: ["Array", "Depth-First Search", "Breadth-First Search", "Matrix"] },
  { title: "Clone Graph", slug: "clone-graph", difficulty: "MEDIUM", tags: ["Hash Table", "Depth-First Search", "Breadth-First Search", "Graph"] },
  { title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "EASY", tags: ["Math", "Dynamic Programming", "Memoization"] },
  { title: "Min Cost Climbing Stairs", slug: "min-cost-climbing-stairs", difficulty: "EASY", tags: ["Array", "Dynamic Programming"] },
  { title: "House Robber", slug: "house-robber", difficulty: "MEDIUM", tags: ["Array", "Dynamic Programming"] },
  { title: "House Robber II", slug: "house-robber-ii", difficulty: "MEDIUM", tags: ["Array", "Dynamic Programming"] },
  { title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", difficulty: "MEDIUM", tags: ["String", "Dynamic Programming"] },
  { title: "Palindromic Substrings", slug: "palindromic-substrings", difficulty: "MEDIUM", tags: ["String", "Dynamic Programming"] },
  { title: "Decode Ways", slug: "decode-ways", difficulty: "MEDIUM", tags: ["String", "Dynamic Programming"] },
  { title: "Coin Change", slug: "coin-change", difficulty: "MEDIUM", tags: ["Array", "Dynamic Programming", "Breadth-First Search"] },
  { title: "Maximum Product Subarray", slug: "maximum-product-subarray", difficulty: "MEDIUM", tags: ["Array", "Dynamic Programming"] },
  { title: "Word Break", slug: "word-break", difficulty: "MEDIUM", tags: ["Hash Table", "String", "Dynamic Programming", "Trie"] },
  { title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", difficulty: "MEDIUM", tags: ["Array", "Binary Search", "Dynamic Programming"] }
];

/**
 * Helper mapping problem slug to tags & metadata.
 */
const SLUG_METADATA_MAP = {};
PROBLEM_BANK.forEach((p) => {
  SLUG_METADATA_MAP[p.slug] = p;
});

module.exports = {
  PROBLEM_BANK,
  SLUG_METADATA_MAP,
};
