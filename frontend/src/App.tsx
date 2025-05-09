import { useState, useEffect, useRef } from "react";
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "@fontsource/capriola";

import { animateScroll as scroll } from "react-scroll";
import Lottie from "lottie-react";
import birdAnimation from "./birdAnimation.json";

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
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);

  const [description, setDescription] = useState("");

  const uploadRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [successToast, setSuccessToast] = useState(false);
  const hasUploadedPhoto = !!file;
  const hasPrediction = !!result;

  const predict = async () => {
    if (!file) return;
    setLoading(true);

    setError(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(
        "https://bird-identifier-iqjp.onrender.com/predict",
        {
          method: "POST",
          body: form,
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server responded with ${res.status}: ${errText}`);
      }

      const data = await res.json();
      setResult(data);
      setSuccessToast(true);
      setLoadingDescription(true);
      // Get GPT-based bird description
      const gptRes = await fetch("/api/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          species: data.species.replace(/^\d+\./, "").replace(/_/g, " "),
        }),
      });
      const gptData = await gptRes.json();
      setDescription(gptData.description);
    } catch (err: any) {
      console.error("Prediction error:", err);
      setError("Oops! Something went wrong while identifying your bird.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
      setLoadingDescription(false);
    }
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

  const getConfidenceMood = (confidence: string) => {
    const value =
      typeof confidence === "string"
        ? parseFloat(confidence.replace("%", ""))
        : confidence;
    if (value >= 90) return { emoji: "🎯", phrase: "it is very confident!" };
    if (value >= 75) return { emoji: "👍", phrase: " looking good!" };
    if (value >= 60) return { emoji: "🤔", phrase: "it is slightly unsure" };
    if (value >= 40)
      return { emoji: "😬", phrase: "it seems to be mostly guessing" };
    return { emoji: "🙈", phrase: "guessing wildly!" };
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
          See a bird? <span style={{ color: "#7877E6" }}>Scout it.</span>
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Curious about that bird you just saw? Upload a photo— Scout tell you
          what’s perched nearby.
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() =>
            scroll.scrollTo((uploadRef.current?.offsetTop ?? 0) - 40, {
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
        }}
        id="upload-section"
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              backdropFilter: "blur(7.5px)",
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
              Upload your Bird Photo
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Scout will try to identify the species using AI. Results may be
              imperfect — our model is still learning!
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
                  setFile(null);
                  setResult(null);
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
              {/* 1. SELECT PHOTO (initial state or retry) */}
              {!hasUploadedPhoto && (
                <label htmlFor="upload-input">
                  <Button variant="outlined" component="span" color="primary">
                    Select Photo
                  </Button>
                </label>
              )}

              {/* 2. IDENTIFY BIRD (after photo selected but before prediction) */}
              {hasUploadedPhoto && !hasPrediction && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={predict}
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                >
                  {loading ? "Identifying..." : "Identify Bird"}
                </Button>
              )}

              {/* 3. UPLOAD ANOTHER PHOTO (after result shown) */}
              {hasUploadedPhoto && hasPrediction && (
                <label htmlFor="upload-input">
                  <Button variant="outlined" component="span" color="primary">
                    Upload Another Photo
                  </Button>
                </label>
              )}
              {loading && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Scout is thinking... 🧠
                </Typography>
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
                  🎉 It's a{" "}
                  <strong style={{ color: "#7877E6" }}>
                    {
                      result.species
                        .replace(/^\d+\./, "") // remove number prefix
                        .replace(/_/g, " ") // replace underscores with space
                    }
                  </strong>
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {getConfidenceMood(result.confidence).emoji} Scout is{" "}
                  {result.confidence} sure —{" "}
                  {getConfidenceMood(result.confidence).phrase}
                </Typography>
                {loadingDescription && (
                  <Typography sx={{ mt: 2, fontStyle: "italic" }}>
                    Fetching a fun fact... ✨
                  </Typography>
                )}

                {!loadingDescription && description && (
                  <Typography sx={{ mt: 2, fontStyle: "italic" }}>
                    {description}
                  </Typography>
                )}
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
            <strong style={{ color: "#7877E6" }}>Scout</strong>- that helps you
            identify the birds around you, spark curiosity, and gradually learn
            to recognize each species, just as my mom and I have.
          </Typography>
          <Typography variant="body1" sx={{ color: "#4F4F4F", mb: 2 }}>
            Scout uses a custom image-classification model based on MobileNetV2,
            fine-tuned on over 200 bird species via transfer learning on more
            than 11,000 high-resolution photos from the{" "}
            <Link
              href="https://www.kaggle.com/datasets/wenewone/cub2002011/data"
              target="_blank"
              rel="noopener"
              sx={{ fontWeight: "bold" }}
            >
              CUB-200-2011 dataset
            </Link>
            . The model is trained in TensorFlow, converted to ONNX for faster
            inference, and served through a FastAPI backend.
          </Typography>
          <Typography variant="body1" sx={{ color: "#4F4F4F", mb: 2 }}>
            Because CUB-200-2011 consists of high-resolution, tightly cropped
            photos of individual birds, Scout performs best on similarly
            zoomed-in, well-framed shots—though it may be less accurate on
            wide-angle or very low-resolution images.
          </Typography>
          <Typography variant="body1" sx={{ color: "#4F4F4F" }}>
            I hope Scout brings you the same excitement my mom and I feel each
            morning when our backyard parrots swing by— happy birdwatching!
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
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={successToast}
        autoHideDuration={4000}
        onClose={() => setSuccessToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessToast(false)} severity="success">
          Bird identified successfully!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
