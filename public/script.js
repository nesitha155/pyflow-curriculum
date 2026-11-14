function startCourse() {
  alert("Welcome to Python Flow! 🚀 Ready to write your first line of Python?");
}

// Press Enter in the search bar to search lessons
document.getElementById("searchInput").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    const query = event.target.value.trim();
    if (query) {
      alert("Searching Python lessons for: " + query);
    }
  }
});