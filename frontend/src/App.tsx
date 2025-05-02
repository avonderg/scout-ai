import React, { useState, useRef } from "react";
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { animateScroll as scroll } from "react-scroll";
import Lottie from "lottie-react";
import birdAnimation from "./birdAnimation.json"; // import your Lottie JSON

const theme = createTheme({
  palette: {
    background: { default: "#FAFAFA" },
    primary: { main: "#457B9D" },
    secondary: { main: "#A8DADC" },
    text: { primary: "rgba(0,0,0,0.87)" },
  },
  typography: { fontFamily: '"Inter","Roboto","Helvetica","Arial",sans-serif' },
});

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  const predict = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      body: form,
    });
    setResult(await res.json());
    scroll.scrollTo(uploadRef.current?.offsetTop ?? 0, { smooth: true });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 4,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box sx={{ width: 200, height: 200, mb: 2 }}>
          <Lottie animationData={birdAnimation} loop />
        </Box>
        <Typography variant="h2" gutterBottom>
          Bird Identifier
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Snap a photo of a bird and let our AI tell you what it is.
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => scroll.scrollTo(window.innerHeight, { smooth: true })}
        >
          Try It Now
        </Button>
      </Box>

      {/* Upload & Predict Section */}
      <Box
        component="section"
        ref={uploadRef}
        sx={{ py: 8, px: 2, backgroundColor: theme.palette.background.paper }}
      >
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" mb={2}>
              Upload Your Photo
            </Typography>
            <input
              type="file"
              accept="image/*"
              id="upload-input"
              style={{ display: "none" }}
              onChange={(e) => {
                const files = e.target.files;
                if (files && files[0]) {
                  const f = files[0];
                  setFile(f);
                  const url = URL.createObjectURL(f);
                  setPreview(url);
                }
              }}
            />
            <label htmlFor="upload-input">
              <Button variant="outlined" component="span" color="primary">
                Choose Image
              </Button>
            </label>
            {preview && (
              <Box
                component="img"
                src={preview}
                sx={{ mt: 2, maxWidth: "100%", borderRadius: 1 }}
              />
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={predict}
              sx={{ mt: 3 }}
            >
              Identify Bird
            </Button>
          </Paper>

          {result && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h6">
                  We think it’s a <strong>{result.species}</strong>
                </Typography>
                <Typography color="text.secondary">
                  Confidence: {result.confidence}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
      >
        <Typography variant="body2">© 2025 Your Name</Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;
