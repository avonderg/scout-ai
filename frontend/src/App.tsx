import React, { useState, useEffect, useRef } from "react";
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
import "@fontsource/capriola";

import { animateScroll as scroll } from "react-scroll";
import Lottie from "lottie-react";
import birdAnimation from "./birdAnimation.json"; // import your Lottie JSON

const theme = createTheme({
  palette: {
    background: {
      default: "#F4F4F3",
    },
    text: {
      primary: "#4F4F4F",
    },
    primary: {
      main: "#7877E6",
    },
  },
  typography: {
    fontFamily: "Capriola",
    h1: {
      color: "#4F4F4F",
    },
    h2: {
      color: "#4F4F4F",
    },
    h3: {
      color: "#7877E6",
    },
    h4: {
      color: "#7877E6",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "999px",
          textTransform: "none",
        },
      },
    },
  },
});

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const predict = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("https://bird-identifier-iqjp.onrender.com", {
      method: "POST",
      body: form,
    });
    setResult(await res.json());
  };

  useEffect(() => {
    if (result && resultRef.current) {
      scroll.scrollTo(resultRef.current.offsetTop - 400, {
        smooth: true,
      });
    }
  }, [result]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getConfidenceLabel = (confidence: string) => {
    const value =
      typeof confidence === "string"
        ? parseFloat(confidence.replace("%", ""))
        : confidence;

    if (value >= 90) return "Very High";
    if (value >= 75) return "High";
    if (value >= 60) return "Moderate";
    if (value >= 40) return "Low";
    return "Very Low";
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "#F4F4F3",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 4,
          py: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Capriola",
            color: "#7877E6",
            cursor: "pointer",
          }}
          onClick={() =>
            document
              .getElementById("hero")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          scout.ai
        </Typography>
        <Button
          variant="text"
          sx={{ color: "#7877E6" }}
          onClick={() =>
            document
              .getElementById("about")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          About
        </Button>
      </Box>

      {/* Hero Section */}
      <Box
        id="hero"
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
          <Lottie animationData={birdAnimation} loop={false} />
        </Box>
        <Typography variant="h2" gutterBottom>
          Welcome to <span style={{ color: "#7877E6" }}>Scout</span>
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Curious about the birds you see? Upload a photo—we'll tell you what’s
          perched nearby.
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() =>
            scroll.scrollTo((uploadRef.current?.offsetTop ?? 0) - 80, {
              smooth: true,
            })
          }
        >
          Try It Now
        </Button>
      </Box>

      {/* Upload & Predict Section */}
      <Box
        component="section"
        ref={uploadRef}
        sx={{
          py: 8,
          px: 2,
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          // background: theme.palette.background.default,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              backdropFilter: "blur(7.5px)",
              // backgroundColor: "rgba(255, 255, 255, 0.3)",
              WebkitBackdropFilter: "blur(7.5px)",
              borderRadius: "10px",
              boxShadow: "0 8px 32px 0 rgba( 0, 0, 0, 0.18 )",
              border: "2px solid rgba(255, 255, 255, 0.4)", // More visible white border
              minHeight: file ? 550 : 100,
              backgroundImage:
                "linear-gradient(to bottom right, rgba(255,255,255,0.25), rgba(255,255,255,0.05))",
            }}
          >
            <Typography variant="h5" mb={3}>
              Upload Your Photo
            </Typography>

            {/* Buttons row */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
              mb={2}
            >
              <input
                type="file"
                accept="image/*"
                id="upload-input"
                style={{ display: "none" }}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files[0]) {
                    const f = files[0];

                    // Validate MIME type
                    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
                    if (!validTypes.includes(f.type)) {
                      alert(
                        "Unsupported file type. Please upload a JPEG or PNG image."
                      );
                      return;
                    }

                    setFile(f);
                    const url = URL.createObjectURL(f);
                    setPreview(url);
                  }
                }}
              />
              <label htmlFor="upload-input">
                <Button variant="outlined" component="span" color="primary">
                  Choose Bird
                </Button>
              </label>

              {file && (
                <Button variant="contained" color="primary" onClick={predict}>
                  Identify Bird
                </Button>
              )}
            </Box>
            {/* Image preview */}
            {preview && (
              <Box
                component="img"
                src={preview}
                sx={{
                  mt: 2,
                  maxWidth: "100%",
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
              />
            )}
          </Paper>

          {result && (
            <Card
              ref={resultRef}
              sx={{
                mt: 4,
                p: 4,
                textAlign: "center",
                backdropFilter: "blur(7.5px)",
                // backgroundColor: "rgba(255, 255, 255, 0.3)",
                WebkitBackdropFilter: "blur(7.5px)",
                borderRadius: "10px",
                boxShadow: "0 8px 32px 0 rgba( 0, 0, 0, 0.18 )",
                border: "2px solid rgba(255, 255, 255, 0.4)", // More visible white border
                backgroundImage:
                  "linear-gradient(to bottom right, rgba(255,255,255,0.25), rgba(255,255,255,0.05))",
              }}
            >
              <CardContent>
                <Typography variant="h6">
                  We think it’s a{" "}
                  <strong style={{ color: "#7877E6" }}>
                    {
                      result.species
                        .replace(/^\d+\./, "") // remove number prefix
                        .replace(/_/g, " ") // replace underscores with space
                    }
                  </strong>
                </Typography>
                <Typography color="text.secondary">
                  Confidence: <strong>{result.confidence + " "}</strong>
                  <span style={{ fontStyle: "italic" }}>
                    ({getConfidenceLabel(result.confidence)})
                  </span>
                </Typography>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      {/* About */}
      <Box
        id="about"
        sx={{
          backgroundColor: "#F4F4F3",
          py: 10,
          px: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          component="img"
          src="/zanaMask.png"
          alt="Little me with two parrots"
          sx={{
            width: "100%",
            maxWidth: 400,
            objectFit: "cover",
            borderRadius: 4,
            transform: "translateY(-10px)", // slight lift
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            animation: "float 4s ease-in-out infinite",
            "@keyframes float": {
              "0%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-20px)" },
              "100%": { transform: "translateY(0px)" },
            },
          }}
        />
        <Box sx={{ maxWidth: "600px", mr: 12 }}>
          <Typography
            variant="h3"
            sx={{ color: "#7877E6", fontFamily: "Capriola", mb: 2 }}
          >
            About Scout
          </Typography>
          <Typography variant="body1" sx={{ color: "#4F4F4F", mb: 2 }}>
            Ever since I was little, I’ve been drawn to animals of all shapes
            and sizes—especially birds. Growing up, one of my favorite outings
            was visiting Miami’s Parrot Jungle with my parents. During the
            pandemic, my mom and I began spending more time outdoors together,
            paying close attention to the wildlife in our neighborhood. Spotting
            great blue herons, egrets, ospreys, cardinals, and the 16 wild
            parrots that visit our backyard twice a day became a daily ritual
            for us. We’d listen for their calls, learn their behaviors, and
            deepen our appreciation for the beauty and subtle spirituality of
            nature. Scout was born out of that shared tradition. It’s my way of
            sharing this joy with others: a virtual companion - a{" "}
            <strong>Scout</strong>- that helps you identify the birds around
            you, spark curiosity, and gradually learn to recognize each species,
            just as my mom and I did.
          </Typography>
          <Typography variant="body1" sx={{ color: "#4F4F4F" }}>
            Scout uses a custom-trained image classification model based on
            MobileNetV2 and fine-tuned on over 200 bird species from the
            CUB-200-2011 dataset. To help the model generalize to real-world
            scenarios—including blurry or zoomed-out iPhone photos—it leverages
            dynamic data augmentation techniques like random cropping, rotation,
            and color jittering during training. The pipeline is built in
            TensorFlow, converted to ONNX for efficient inference, and served
            through a lightweight FastAPI backend.
          </Typography>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
      >
        <Typography variant="body2">© 2025 avonderg</Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;
